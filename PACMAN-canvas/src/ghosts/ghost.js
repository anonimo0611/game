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

export class Ghost extends Actor {
	#runaway   = -1
	#revSig    = false
	#isStarted = false
	#isFright  = false

	TurnDirs = /**@type {readonly Direction[]}*/([U,L,D,R])

	// This section is overridden in subclasses
	get isAngry()     {return false}
	get chaseStep()   {return GhsStep.Base}
	get chasePos()    {return Player.instance.centerPos}
	get scatterTile() {return Vec2()}

	get aIdx()        {return GhsMgr.animIndex & this.animFlag}
	get spriteIdx()   {return GhsMgr.spriteIdx}
	get maxAlpha()    {return Ctrl.showTargets ? 0.75:1}
	get chaseTile()   {return this.chasePos.divInt(T)}
	get isStarted()   {return this.#isStarted}
	get isFright()    {return this.#isFright}
	get isIdle()      {return this.state.isIdle}
	get isGoOut()     {return this.state.isGoOut}
	get isBitten()    {return this.state.isBitten}
	get isEscaping()  {return this.state.isEscaping}

	/** @param {Direction} dir */
	constructor(dir=L, {col=0,row=0,idx=0,align=0,animFlag=1}={}) {
		super()
		this.on({
			FrightMode:  this.#setFrightMode,
			Reverse:()=> this.#revSig  = true,
			Runaway:()=> this.#runaway = 400/Game.interval,
		})
		this.dir      = dir
		this.idx      = idx
		this.initX    = col*T
		this.iniAlign = align
		this.animFlag = animFlag
		this.pos      = Vec2(col*T, row*T)
		this.color    = Color[GhsNames[idx]]
		this.release  = this.release.bind(this)
		this.state    = new Sys.GhostState(this)
		this.sprite   = new Sprite(canvas2D(null, T*3, T*2).ctx)
		freeze(this)
	}
	get isChase() {
		return !this.isScatter
			&&  this.state.isWalk
	}
	get isScatter() {
		return GhsMgr.isScatter
			&& !this.isFright
			&& !this.isEscaping
			&& !this.isAngry
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
			&& abs(CW/2 - this.centerPos.x) <= this.step
	}
	get sqrMagToPacman() {
		return Vec2.sqrMag(this, Player.instance)
	}
	get step() {
		return function(g) {
			if (g.isIdle)     return GhsStep.Idle
			if (g.isGoOut)    return GhsStep.GoOut
			if (g.isEscaping) return GhsStep.Escape
			if (g.isInTunnel) return GhsStep.InTunnel
			if (g.isFright)   return GhsStep.Fright
			if (g.isScatter)  return GhsStep.Base
			return g.chaseStep
		}(this) * Game.moveSpeed
	}
	draw() {
		if (State.isStart) return
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
			: State.isPlaying && this.#behavior(this)
	}
	#behavior({state:s}=this) {
		this.#runaway >= 0 && this.#runaway--
		if (this.frozen && !this.isEscaping) return
		if (s.isIdle)   return this.#idle(this)
		if (s.isGoOut)  return this.#goOut(this)
		if (s.isReturn) return this.#returnToHome(this)
		this.#walkRails()
	}
	#idle({idx,step,orient,state,centerPos:{y:cy}}=this) {
		if (!Ctrl.isChaseMode)
			Sys.DotCounter.release(idx, this.release)
		!state.isGoOut && this.move(
			(cy+T*0.6-step > Maze.House.MiddleY && orient != D)? U:
			(cy-T*0.6+step < Maze.House.MiddleY ? D:U)
		)
	}
	release(deactivateGlobalDotCnt=false) {
		Player.instance.resetTimer()
		this.state.isIdle && this.state.to('GoOut')
		return deactivateGlobalDotCnt
	}
	#goOut({centerPos:{x:cx},y,step}=this) {
		if (cx > CW/2+step
		 || cx < CW/2-step)
			return this.move(this.iniAlign<0 ? R:L)

		if (cx != CW/2)
			return this.centering()

		if (y > Maze.House.EntranceTile.y*T+step)
			return this.move(U)

		this.dir = L
		this.#isStarted ||= true
		this.state.to('Walk')
	}
	#prepEnterHouse() {
		this.dir = D
		this.centering()
		this.state.to('Return')
	}
	#returnToHome({step,x,y,initX,iniAlign}=this) {
		if (y+step < Maze.House.MiddleY)
			return this.setNextPos()

		if (y != Maze.House.MiddleY)
			return this.setPos({y:Maze.House.MiddleY})

		if (!iniAlign || abs(x-initX) <= step) {
			this.x   = initX
			this.dir = iniAlign? (iniAlign<0 ? R:L) : U
			this.#arrivedAtHome()
			return
		}
		this.move(iniAlign<0 ? L:R)
	}
	#arrivedAtHome() {
		this.sprite.setResurrect()
		;(Ctrl.isChaseMode || this.idx == GhsType.Akabei)
			? this.state.to('GoOut')
			: this.state.to('Idle') && this.#idle(this)
		!this.frozen && Sound.ghostArrivedAtHome()
	}
	#walkRails() {
		for (const _ of range(this.stepDiv)) {
			this.setNextPos(this.stepDiv)
			this.inBackOfTile && this.#setNextDir()
			if (this.#setTurn(this)) break
			if (this.crashWithPac()) break
		}
	}
	#setNextDir() {
		if (this.#revSig) {
			this.#revSig = false
			this.orient  = this.revDir
			return
		}
		if (this.dir == this.orient)
			this.orient = this.#getNextDir()
	}
	#getNextDir(tgt=this.targetTile) {
		const tile = this.getAdjTile(this.dir)
		const dirs = this.TurnDirs.flatMap((dir,i)=> {
			const test = this.getAdjTile(dir,tile)
			const dist = Vec2.sqrMag(test,tgt)
			return this.revOrient != dir
				&& Maze.hasWall(test) == false
				&& this.#canEnter({dir,test})? [{i,dir,dist}]:[]
		})
		return this.isFright? randChoice(dirs).dir:
			(idx=> dirs.sort(compareDist)[idx].dir)
				(this.#runaway >= 0 ? dirs.length-1:0)
	}
	/** @param {{dir:Direction, test:Vector2}} cfg */
	#canEnter({dir,test}) {
		return Ctrl.unrestricted
			|| (dir != U || this.isFright || this.isEscaping)
			|| Maze.GhostNoEnter.has(test.hyphenated) == false
	}
	#setTurn({dir,orient,pos,tilePos:t}=this) {
		if (dir == orient
		 || this.hasAdjWall(orient))
			return false
		if (dir == L && pos.x < t.x*T
		 || dir == R && pos.x > t.x*T
		 || dir == U && pos.y < t.y*T
		 || dir == D && pos.y > t.y*T) {
			this.pos = t.mul(T)
			this.setMoveDir(orient)
			return true
		}
		return false
	}
	crashWithPac({
		pos     = Player.instance.pos,
		radius  = (this.isFright? T/2:T/3),
		release = ()=> this.#setEscape()
	}={}) {
		if (!this.state.isWalk
		 || !this.isFright && Ctrl.invincible
		 || !collisionCircle(this, pos, radius))
			return false
		if (this.isFright) {
			this.#caught(release)
			return true
		}
		Sound.stopLoops()
		State.to('Crashed').to('Losing', {delay:500})
		return true
	}
	/** @param {unknown} _ */
	#setFrightMode(_, bool=false) {
		!this.isEscaping && (this.#isFright = bool)
	}
	/** @param {Function} fn */
	#caught(fn) {
		this.#isFright = false
		this.trigger('Cought').state.to('Bitten')
		Timer.freeze()
		Sound.play('bitten')
		PtsMgr.set({key:GhsMgr, pos:this.centerPos}, fn)
	}
	#setEscape() {
		Sound.ghostEscape()
		this.state.to('Escape')
	}
}