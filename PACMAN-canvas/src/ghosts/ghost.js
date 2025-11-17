import {Sound}   from '../../_snd/sound.js'
import {Game}    from '../_main.js'
import {State}   from '../state.js'
import {Ctrl}    from '../control.js'
import {PtsMgr}  from '../points.js'
import {Maze}    from '../maze.js'
import {Actor}   from '../actor.js'
import {pacman}  from '../player/pacman.js'
import {GhsMgr}  from './_system.js'
import * as Sys  from './_system.js'
import Sprite    from '../sprites/ghost.js'

export class Ghost extends Actor {
	#runaway   = -1
	#revSig    = false
	#isStarted = false
	#isFright  = false

	/** @readonly */idx
	/** @readonly */init
	/** @readonly */state

	/** @readonly */
	sprite = new Sprite(canvas2D(null, T*3, T*2).ctx)

	/** @readonly */
	turnDirs = /**@type {readonly Direction[]}*/([U,L,D,R])

	get isAngry()     {return false}
	get chaseStep()   {return GhsStep.Base}
	get chasePos()    {return pacman.center}
	get chaseTile()   {return this.chasePos.divInt(T)}
	get scatterTile() {return Vec2.new(24, 0)}
	get maxAlpha()    {return Ctrl.showTargets? 0.75:1}
	get spriteIdx()   {return GhsMgr.spriteIdx}
	get animIdx()     {return GhsMgr.animIndex &  this.init.animFlag}
	get isChasing()   {return GhsMgr.isChasing && this.isNormWalk}
	get isScatter()   {return GhsMgr.isScatter && this.isNormWalk && !this.isAngry}
	get isStarted()   {return this.#isStarted}
	get isFright()    {return this.#isFright}
	get isBitten()    {return this.state.isBitten}
	get isEscape()    {return this.state.isEscape || this.state.isReturn}
	get isNormWalk()  {return !this.isFright && this.state.isWalk}

	/**
	 @param {Direction} dir
	 @param {{idx?:number, tile?:xyList, align?:-1|0|1, animFlag?:0|1}} cfg
	*/
	constructor(dir=L, {idx=0,tile:[col,row]=[0,0],align=0,animFlag=1}={}) {
		super()
		this.on({
			FrightMode:  this.#setFrightMode,
			Reverse:()=> this.#revSig  = true,
			Runaway:()=> this.#runaway = 400/Game.interval,
		})
		this.pos.set(col*T,row*T)
		this.idx   = idx
		this.dir   = dir
		this.init  = freeze({...this.pos,align,animFlag})
		this.state = freeze(new Sys.GhostState(this))
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
			&& abs(BW/2 - this.center.x) <= this.step
	}
	get sqrMagToPacman() {
		return Vec2.sqrMag(this, pacman)
	}
	get step() {
		return function(g,s) {
			if (s.isIdle)    return GhsStep.Idle
			if (s.isGoOut)   return GhsStep.GoOut
			if (g.isEscape)  return GhsStep.Escape
			if (g.inTunnel)  return GhsStep.InTunnel
			if (g.isFright)  return GhsStep.Fright
			if (g.isScatter) return GhsStep.Base
			return g.chaseStep
		}(this,this.state) * Game.moveSpeed
	}
	draw() {
		if (State.isStart) return
		Ctx.save()
		this.setFadeInAlpha()
		this.sprite.fadeOut?.setAlpha(Ctx)
		this.sprite.draw(this)
		Ctx.restore()
	}
	update() {
		this.updateFadeIn()
		this.sprite.fadeOut?.update()
		this.sprite.update()
		this.houseEntranceArrived
			? this.#prepEnterHouse()
			: State.isPlaying && this.#behavior()
	}
	#behavior() {
		this.#runaway >= 0 && this.#runaway--
		if (Timer.frozen && !this.isEscape) return
		switch(this.state.current) {
		case 'Idle':  return this.#idle(this)
		case 'GoOut': return this.#goOut(this)
		case 'Return':return this.#returnToHome(this)
		default: this.#walkPath(this.step+.5|0)
		}
	}
	#idle({idx,orient,state,step,center:{y:cy}}=this) {
		if (!Ctrl.alwaysChase)
			Sys.DotCounter.release(idx, b=> this.leaveHouse(b))
		!state.isGoOut && this.move(
			(cy+T*0.6-step > Maze.House.MiddleY && orient != D)? U:
			(cy-T*0.6+step < Maze.House.MiddleY ? D:U)
		)
	}
	leaveHouse(deactivateGlobalDotCnt=false) {
		pacman.resetTimer()
		this.state.isIdle && this.state.to('GoOut')
		return deactivateGlobalDotCnt
	}
	#goOut({init,step,y,center:{x:cx}}=this) {
		if (cx > BW/2+step
		 || cx < BW/2-step)
			return this.move(init.align<0 ? R:L)

		if (cx != BW/2)
			return this.centering()

		if (y > Maze.House.EntranceTile.y*T)
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
	#returnToHome({init,step,x,y}=this) {
		if (y+step < Maze.House.MiddleY)
			return this.move()

		if (y != Maze.House.MiddleY)
			return this.pos.setY(Maze.House.MiddleY).void()

		if (!init.align || abs(x-init.x) <= step) {
			this.x   = init.x
			this.dir = init.align? (init.align<0 ? R:L) : U
			this.#arrivedAtHome()
			return
		}
		this.move(init.align<0 ? L:R)
	}
	#arrivedAtHome() {
		this.sprite.setResurrect()
		;(Ctrl.alwaysChase || this.idx == GhsType.Akabei)
			? this.state.to('GoOut')
			: this.state.to('Idle') && this.#idle(this)
		!Timer.frozen && Sound.ghostArrivedAtHome()
	}
	#walkPath(divisor=1) {
		for (const _ of range(divisor)) {
			this.setNextPos(divisor)
			this.passedTileCenter && this.#setNextDir()
			if (this.#setTurn(this)) break
			if (this.crashWithPac()) break
		}
	}
	#setNextDir() {
		if (this.#revSig) {
			this.#revSig = false
			this.orient  = this.revDir
		}
		if (this.dir == this.orient)
			this.orient = this.#getNextDir()
	}
	#getNextDir(tgt=this.targetTile) {
		const tile = this.getAdjTile(this.dir)
		const dirs = this.turnDirs.flatMap
		((dir,idx)=> {
			const test = this.getAdjTile(dir,tile)
			return Maze.hasWall(test) == false
				&& this.revOrient != dir
				&& this.#canEnter({dir,test})
				? [{idx,dir,dist:Vec2.sqrMag(test,tgt)}]:[]
		})
		return this.isFright? randChoice(dirs).dir:
			(idx=> dirs.sort(compareDist)[idx].dir)
				(this.#runaway >= 0 ? dirs.length-1:0)
	}
	/** @param {{dir:Direction, test:Vec2}} cfg */
	#canEnter({dir,test}) {
		return Ctrl.unrestricted
			|| (dir != U || this.isFright || this.isEscape)
			|| !Maze.GhostNoEnter.has(test.hyphenated)
	}
	#setTurn({orient}=this) {
		if (this.dir != orient
		 && this.hasAdjWall(orient) == false
		 && this.passedTileCenter
		) {
			this.pos = this.tilePos.mul(T)
			this.setMoveDir(orient)
			return true
		}
		return false
	}
	crashWithPac({
		pos     = pacman.pos,
		radius  = this.isFright? T/2:T/3,
		release = ()=> this.#setEscape(),
	}={}) {
		if (!this.state.isWalk
		 || !this.isFright && Ctrl.invincible
		 || !circleCollision(this, pos, radius))
			return false
		this.isFright
			? this.#caught(release)
			: this.#attack()
		return true
	}
	#caught(release=()=>{}) {
		this.#isFright = false
		this.state.to('Bitten')
		Sound.play('bitten')
		Timer.freeze()
		PtsMgr.set({key:GhsMgr, pos:this.center}, release)
	}
	#attack() {
		Sound.stopLoops()
		State.to('Crashed').to('Dying', {delay:500})
	}
	#setFrightMode(_={}, bool=false) {
		!this.isEscape && (this.#isFright = bool)
	}
	#setEscape() {
		Sound.ghostEscape()
		this.state.to('Escape')
	}
}