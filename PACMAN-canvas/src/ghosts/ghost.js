import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {PtsMgr} from '../points.js'
import {Maze}   from '../maze.js'
import {Actor}  from '../actor.js'
import {Player} from '../pacman.js'
import {GhsMgr} from './_system.js'
import * as Sys from './_system.js'
import Sprite   from '../sprites/ghost.js'

const compareDist = (a,b)=>
	(a.dist == b.dist)? (a.index-b.index) : (a.dist-b.dist)

export class Ghost extends Actor {
	#runAway    = -1
	#started    = false
	#revSig     = false
	#frightened = false

	// This section is overridden in subclasses
	get angry()       {return false}
	get chaseStep()   {return GhsStep.Base}
	get chasePos()    {return Player.centerPos}
	get scatterTile() {return Vec2()}

	get spriteIdx()   {return GhsMgr.spriteIdx}
	get aIdx()        {return GhsMgr.animIndex & this.aniFlag}
	get maxAlpha()    {return Ctrl.showTargets ? this.cheatAlpha : 1}
	get started()     {return this.#started}
	get frightened()  {return this.#frightened}
	get bitten()      {return this.state.isBitten}
	get escaping()    {return this.state.isEscaping}
	get chaseTile()   {return this.chasePos.divInt(T)}

	constructor({col=0,row=0,idx=0,align=0,aniFlag=1,orient=L}={}) {
		super(orient)
		this.addHandler({
			FrightMode:  this.#setFrightMode,
			Reverse:()=> this.#revSig  = true,
			Runaway:()=> this.#runAway = 400/Game.interval,
		})
		this.idx     = idx
		this.initX   = col*T
		this.iAlign  = align
		this.aniFlag = aniFlag
		this.pos     = Vec2(col*T, row*T)
		this.name    = this.constructor.name
		this.release = this.release.bind(this)
		this.state   = new Sys.GhostState(this)
		this.sprite  = new Sprite(canvas2D(null, T*3, T*2).ctx)
		freeze(this)
	}
	get isScatter() {
		return GhsMgr.isScatter
			&& !this.frightened
			&& !this.state.isEscape
			&& !this.angry
	}
	get originalTargetTile() {
		return this.state.isEscape
			? Maze.House.EntranceTile
			: this.isScatter
				? this.scatterTile
				: this.chaseTile
	}
	get targetTile() {
		return Ctrl.unrestricted
			? this.originalTargetTile
			: Maze.ghostExitTile(this)
	}
	get houseEntranceArrived() {
		return this.state.isEscape
			&& this.tilePos.y == Maze.House.EntranceTile.y
			&& abs(CvsW/2 - this.centerPos.x) <= this.step
	}
	get sqrMagToPacman() {
		return Vec2.sqrMag(this, Player.pos)
	}
	get step() {
		return (state=> {
			if (state.isIdle)    return GhsStep.Idle
			if (state.isGoOut)   return GhsStep.GoOut
			if (state.isEscape)  return GhsStep.Escape
			if (state.isReturn)  return GhsStep.Return
			if (this.isInTunnel) return GhsStep.InTunnel
			if (this.frightened) return GhsStep.Fright
			if (this.isScatter)  return GhsStep.Base
			return this.chaseStep
		})(this.state) * Game.moveSpeed
	}
	draw() {
		if (State.isStart)
			return
		Ctx.save()
		super.draw()
		this.sprite.fadeOut?.setAlpha(Ctx)
		this.sprite.draw(this)
		Ctx.restore()
	}
	update() {
		super.update()
		this.sprite.fadeOut?.update()
		this.sprite.update()
		this.houseEntranceArrived
			? this.#prepEnterHouse()
			: State.isPlaying && this.#behavior()
	}
	#behavior() {
		this.#runAway >= 0 && this.#runAway--
		if (Timer.frozen && !this.escaping)
			return
		switch (this.state.current) {
		case 'Idle':  return this.#idle(this)
		case 'GoOut': return this.#goOut(this)
		case 'Return':return this.#returnToHome(this)
		default: this.#walk()
		}
	}
	#idle({idx,step,orient,centerPos:{y:cy}}=this) {
		if (!Ctrl.isChaseMode) {
			Sys.DotCounter.release(idx, this.release)
		}
		if (!this.state.isGoOut) {
			this.move((cy+T*0.6-step > Maze.House.MiddleY && orient != D)
				? U : (cy-T*0.6+step < Maze.House.MiddleY ? D:U))
		}
	}
	release(deactivateGlobalDotCnt=false) {
		Player.instance.resetTimer()
		this.state.isIdle && this.state.to('GoOut')
		return deactivateGlobalDotCnt
	}
	#goOut({centerPos:{x:cx},y,step}=this) {
		if (cx > CvsW/2+step
		 || cx < CvsW/2-step)
			return this.move(this.iAlign<0 ? R:L)

		if (cx != CvsW/2)
			return this.centering()

		if (y > Maze.House.EntranceTile.y*T+step)
			return this.move(U)

		this.dir = L
		this.#started ||= true
		this.state.to('Walk')
	}
	#prepEnterHouse() {
		this.state.to('Return')
		this.dir = D
		this.centering()
	}
	#returnToHome({step,x,y,initX,iAlign}=this) {
		if (y+step < Maze.House.MiddleY)
			return this.setNextPos()

		if (y != Maze.House.MiddleY)
			return this.setPos({y:Maze.House.MiddleY})

		if (!iAlign || abs(x-initX) <= step) {
			this.x   = initX
			this.dir = iAlign? (iAlign<0 ? R:L) : U
			this.#arrivedAtHome()
			return
		}
		this.move(iAlign<0 ? L:R)
	}
	#arrivedAtHome() {
		this.sprite.setResurrect()
		;(Ctrl.isChaseMode || this.idx == GhsType.Akabei)
			? this.state.to('GoOut')
			: this.state.to('Idle') && this.#idle(this)
		!Timer.frozen && Sound.ghostArrivedAtHome()
	}
	#walk() {
		for (let i=0,denom=ceil(this.step)*2; i<denom; i++) {
			this.setNextPos(denom)
			this.inBackwardOfTile && this.#setNextDir()
			if (this.#setTurn(this)) break
			if (GhsMgr.crashWithPac(this)) break
		}
	}
	#setNextDir() {
		if (this.#revSig) {
			this.#revSig = false
			this.orient  = Dir.opp.get(this.dir)
			return
		}
		if (this.dir == this.orient)
			this.orient = this.#getNextDir()
	}
	#getNextDir(target=this.targetTile) {
		const tile = this.getAdjTile(this.dir)
		const dirs = [U,L,D,R].flatMap((dir,index)=> {
			const  test = this.getAdjTile(dir,1,tile)
			const  dist = Vec2.sqrMag(test,target)
			return this.#isAllowDir(dir,test)? {index,dir,dist}:[]
		})
		return this.frightened
			? randChoice(dirs).dir
			: dirs.sort(compareDist).at(this.#runAway<0 ? 0:-1).dir
	}
	#isAllowDir(dir, tile) {
		return !Maze.hasWall(tile)
			&& !this.#notEnterTile(dir,tile)
		    && Dir.opp.get(this.orient) != dir
	}
	#notEnterTile(dir, tile) {
		return !Ctrl.unrestricted
			&& (this.state.isWalk && !this.frightened)
			&& (dir == U)
			&& Maze.GhostNotEnterSet.has(tile.hyphenated)
	}
	#setTurn({dir,orient,pos,tilePos:t}=this) {
		if (dir == orient
		 || this.hasAdjWall(orient))
			return false
		if (dir == L && pos.x < t.x*T
		 || dir == R && pos.x > t.x*T
		 || dir == U && pos.y < t.y*T
		 || dir == D && pos.y > t.y*T) {
			this.movDir = this.orient
			this.pos = t.mul(T)
			return true
		}
		return false
	}
	crashWithPac({
		pos    = Player.pos,
		radius = (this.frightened? T/2:T/3),
		fn = ()=> this.#setEscape()
	}={}) {
		if (!this.state.isWalk
		 || !collisionCircle(this, pos, radius))
			return false
		if (this.frightened) {
			Sound.play('bitten')
			Timer.freeze()
			this.#frightened = false
			this.trigger('Cought').state.to('Bitten')
			PtsMgr.set({key:GhsMgr, ...this.centerPos}, fn)
			return true
		}
		if (!Ctrl.invincible) {
			Sound.stopLoops()
			State.to('Crashed').to('Losing', {delay:500})
			return true
		}
		return false
	}
	#setFrightMode(_, bool=false) {
		!this.escaping && (this.#frightened = bool)
	}
	#setEscape() {
		Sound.ghostEscape()
		this.state.to('Escape')
	}
}