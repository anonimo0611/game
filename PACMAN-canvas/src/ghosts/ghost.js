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
		this.aniFlag = +aniFlag
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
	get originalTarget() {
		return this.state.isEscape
			? Maze.House.EntranceTile
			: this.isScatter
				? this.scatterTile
				: this.chaseTile
	}
	get targetTile() {
		return Ctrl.unrestricted
			? this.originalTarget
			: Maze.ghostExitPos(this)
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
		const spd = Game.moveSpeed, {state}= this
		if (state.isIdle)    return spd * GhsStep.Idle
		if (state.isGoOut)   return spd * GhsStep.GoOut
		if (state.isEscape)  return spd * GhsStep.Escape
		if (state.isReturn)  return spd * GhsStep.Return
		if (this.isInTunnel) return spd * GhsStep.InTunnel
		if (this.frightened) return spd * GhsStep.Fright
		return spd * (this.isScatter? GhsStep.Base : this.chaseStep)
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
		if (this.houseEntranceArrived) {
			this.state.switchToReturn()
			this.centering()
		}
		if (State.isPlaying && Maze.dotsLeft) {
			this.#behavior()
			GhsMgr.crashWithPac(this)
		}
	}
	#behavior() {
		const {state}= this
		this.#runAway >= 0 && this.#runAway--
		if (Timer.frozen && !this.escaping) return
		if (state.isIdle)   return this.#idle(this)
		if (state.isGoOut)  return this.#goOut(this)
		if (state.isReturn) return this.#returnToHome(this)
		this.#walk()
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
		this.state.isIdle && this.state.switchToGoOut()
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
		this.state.switchToWalk()
	}
	#returnToHome({step,x,y,initX,iAlign}=this) {
		if (y+step < Maze.House.MiddleY)
			return this.move(D)

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
			? this.state.switchToGoOut()
			: this.state.switchToIdle() && this.#idle(this)
		!Timer.frozen && Sound.ghostArrivedAtHome()
	}
	#walk() {
		for (let i=0,denom=ceil(this.step)*2; i<denom; i++) {
			this.setNextPos(denom)
			this.inBackwardOfTile && this.#setNextDir()
			this.#setTurn(this)
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
		if (dir == orient || this.hasAdjWall(orient))
			return
		if (dir == L && pos.x < t.x*T
		 || dir == R && pos.x > t.x*T
		 || dir == U && pos.y < t.y*T
		 || dir == D && pos.y > t.y*T) {
			this.movDir = this.orient
			this.pos = t.mul(T)
		}
	}
	#setFrightMode(_, bool=false) {
		!this.escaping && (this.#frightened = bool)
	}
	crashWithPac(fn = ()=> this.#setEscape()) {
		if (this.frightened) {
			if (Timer.frozen) return
			Timer.freeze()
			this.#frightened = false
			this.state.switchToBitten()
			this.trigger('Cought')
			PtsMgr.set({key:GhsMgr, ...this.centerPos}, fn)
			Sound.play('bitten')
			return
		}
		!Ctrl.invincible
			&& State.isPlaying
			&& Sound.stopLoops()
			&& State.switchToCrashed()
			&& State.switchToLosing({delay:500})
	}
	#setEscape() {
		Sound.ghostEscape()
		this.state.switchToEscape()
	}
}