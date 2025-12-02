import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {PtsMgr} from '../points.js'
import {Maze}   from '../maze.js'
import {Actor}  from '../actor.js'
import {pacman} from '../player/pacman.js'
import {GhsMgr} from './_system.js'
import * as Sys from './_system.js'
import Sprite   from '../sprites/ghost.js'

export class Ghost extends Actor {
	/** @readonly */type
	/** @readonly */init
	/** @readonly */state

	/** @readonly */
	sprite  = new Sprite(canvas2D(null, T*3, T*2).ctx)
	#fadeIn = new Actor.SpawnFadeIn

	/** @readonly */
	turnDirs = /**@type {readonly Direction[]}*/([U,L,D,R])

	#fleeTime   = -1
	#reversal   = false
	#started    = false
	#frightened = false

	get angry()       {return false}
	get chaseSpeed()  {return GhsSpeed.Base}
	get chasePos()    {return pacman.center}
	get maxAlpha()    {return Ctrl.showTargets? .75:1}
	get scatterTile() {return Vec2.new(24, 0)}
	get chaseTile()   {return this.chasePos.divInt(T)}

	get started()     {return this.#started}
	get frightened()  {return this.#frightened}
	get bitten()      {return this.state.isBitten}
	get walking()     {return this.state.isWalking && !this.frightened}
	get escaping()    {return this.state.isEscaping || this.state.isReturning}

	get spriteIdx()   {return GhsMgr.spriteIdx}
	get animIdx()     {return GhsMgr.animIndex}
	get chasing()     {return GhsMgr.isChaseMode   && this.walking}
	get scattering()  {return GhsMgr.isScatterMode && this.walking && !this.angry}

	/**
	 @param {Direction} dir
	 @param {{type?:number, tile?:xyList, align?:-1|0|1}} cfg
	*/
	constructor(dir=L, {type=0,tile:[col,row]=[0,0],align=0}={}) {
		super()
		this.on({
			FrightMode:   this.#setFrightMode,
			Reverse: ()=> this.#reversal = true,
			FleeTime:()=> this.#fleeTime = 400/Game.interval,
		})
		this.pos.set(col*T,row*T)
		this.dir   = dir
		this.type  = type
		this.init  = freeze({align,x:col*T})
		this.state = freeze(new Sys.GhostState(this))
	}
	get originalTargetTile() {
		return this.state.isEscaping
			? Maze.House.EntranceTile
			: this.scattering
				? this.scatterTile
				: this.chaseTile
	}
	get targetTile() {
		return Ctrl.unrestricted
			? this.originalTargetTile
			: Maze.getGhostExitTile(this)
	}
	get houseEntranceArrived() {
		return this.state.isEscaping
			&& this.tilePos.y == Maze.House.EntranceTile.y
			&& abs(BW/2 - this.center.x) <= this.speed
	}
	get sqrMagToPacman() {
		return Vec2.sqrMag(this, pacman.pos)
	}
	get speed() {
		return function(g,s) {
			if (s.isIdle)     return GhsSpeed.Idle
			if (s.isGoingOut) return GhsSpeed.GoOut
			if (g.escaping)   return GhsSpeed.Escape
			if (g.inTunSide)  return GhsSpeed.InTunnel
			if (g.frightened) return GhsSpeed.Fright
			if (g.scattering) return GhsSpeed.Base
			return g.chaseSpeed
		}(this,this.state) * Game.moveSpeed
	}
	draw() {
		if (State.isStarting) return
		Ctx.save()
		this.#fadeIn.setAlpha(this.maxAlpha)
		this.sprite.draw(this)
		Ctx.restore()
	}
	update() {
		this.#fadeIn.update(this.maxAlpha)
		this.sprite.update()
		this.houseEntranceArrived
			? this.#enterHouse()
			: State.isPlaying
				&& this.#processBehavior()
	}
	#processBehavior() {
		this.#fleeTime >= 0 && this.#fleeTime--
		if (Timer.frozen && !this.escaping) return
		switch(this.state.current) {
		case 'Idle':     return this.#idleInHouse(this)
		case 'GoingOut': return this.#goingOut(this)
		case 'Returning':return this.#returnToHome(this)
		default: this.#walkPath(this.speed+.5|0)
		}
	}
	#idleInHouse({type,orient,speed,center:{y:cy}}=this) {
		if (!Ctrl.alwaysChase)
			Sys.DotCounter.releaseIfReady(type,g=>this.leaveHouse(g))
		!this.state.isGoingOut && this.move(
			(cy+T*0.6-speed > Maze.House.MiddleY && orient != D)? U:
			(cy-T*0.6+speed < Maze.House.MiddleY ? D:U)
		)
	}
	leaveHouse(deactivateGlobalDotCnt=false) {
		pacman.resetTimer()
		this.state.isIdle &&
		this.state.toGoingOut()
		return deactivateGlobalDotCnt
	}
	#goingOut({init,speed,y,center:{x:cx}}=this) {
		if (cx > BW/2+speed
		 || cx < BW/2-speed)
			return this.move(init.align<0 ? R:L)

		if (cx != BW/2)
			return this.centering()

		if (y > Maze.House.EntranceTile.y*T)
			return this.move(U)

		this.dir = L
		this.#started ||= true
		this.state.toWalking()
	}
	#enterHouse() {
		this.dir = D
		this.centering()
		this.state.toReturning()
	}
	#returnToHome({init,speed,x,y}=this) {
		if (y+speed < Maze.House.MiddleY)
			return this.move()

		if (y != Maze.House.MiddleY)
			return this.pos.setY(Maze.House.MiddleY).void()

		if (!init.align || abs(x-init.x) <= speed) {
			this.x   = init.x
			this.dir = init.align? (init.align<0 ? R:L) : U
			this.#arrivedAtHome()
			return
		}
		this.move(init.align<0 ? L:R)
	}
	#arrivedAtHome() {
		this.sprite.setResurrect()
		;(Ctrl.alwaysChase || this.type == GhsType.Akabei)
			? this.state.toGoingOut()
			: this.state.toIdle() && this.#idleInHouse(this)
		!Timer.frozen && Sound.ghostArrivedAtHome()
	}
	#walkPath(divisor=1) {
		for (const _ of range(divisor)) {
			this.setNextPos(divisor)
			this.passedTileCenter && this.#setNextDir()
			if (this.#makeTurn(this)) break
			if (this.collidesWithPacman()) break
		}
	}
	#setNextDir() {
		if (this.#reversal) {
			this.#reversal = false
			this.orient = this.revDir
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
		return this.frightened? randChoice(dirs).dir:
			(idx=> dirs.sort(compareDist)[idx].dir)
				(this.#fleeTime >= 0 ? dirs.length-1:0)
	}
	/** @param {{dir:Direction, test:Vec2}} cfg */
	#canEnter({dir,test}) {
		return Ctrl.unrestricted
			|| (dir != U || this.frightened || this.escaping)
			|| !Maze.GhostNoEnterCoords.has(test.hyphenated)
	}
	#makeTurn({orient}=this) {
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
	collidesWithPacman({
		pos     = pacman.pos,
		radius  = this.frightened? T/2:T/3,
		release = ()=> this.#setEscapeState(),
	}={}) {
		if (!this.state.isWalking
		 || !this.frightened && Ctrl.invincible
		 || !circleCollision(this,pos,radius))
			return false
		this.frightened
			? this.#setBittenState(release)
			: this.#setPacCaughtState()
		return true
	}
	#setBittenState(release=()=>{}) {
		Sound.play('bitten')
		this.#frightened = false
		this.state.toBitten()
		Timer.freeze()
		PtsMgr.set({key:GhsMgr, pos:this.center}, release)
	}
	#setPacCaughtState() {
		Sound.stopLoops()
		State.toPacCaught().toPacDying({delay:500})
	}
	#setFrightMode(_={}, on=false) {
		!this.escaping && (this.#frightened = on)
	}
	#setEscapeState() {
		Sound.ghostEscape()
		this.state.toEscaping()
	}
}