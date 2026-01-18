import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {PtsMgr} from '../points.js'
import {Maze}   from '../maze.js'
import {Actor}  from '../actor.js'
import {player} from '../player/player.js'
import {GhsMgr} from './_system.js'
import * as Sys from './_system.js'
import Sprite   from '../sprites/ghost.js'

export class Ghost extends Actor {
	/** @readonly */type
	/** @readonly */init
	/** @readonly */state

	/** @readonly */
	sprite  = new Sprite
	#fadeIn = new Actor.SpawnFade

	/** @readonly */
	turnDirs = /**@type {readonly Direction[]}*/([U,L,D,R])

	#fleeTime   = -1
	#revSignal  = false
	#started    = false
	#frightened = false

	get isAngry()      {return false}
	get maxAlpha()     {return Ctrl.showTargets? .75:1}
	get chaseSpeed()   {return GhsSpeed.Base}
	get chasePos()     {return player.center}
	get scatterTile()  {return Vec2.new(24, 0)}
	get chaseTile()    {return this.chasePos.divInt(T)}

	get spriteIdx()    {return GhsMgr.spriteIdx}
	get animIdx()      {return GhsMgr.animIndex}
	get isChasing()    {return GhsMgr.isChaseMode   && this.isWalking}
	get isScattering() {return GhsMgr.isScatterMode && this.isWalking && !this.isAngry}
	get isStarted()    {return this.#started}
	get isFrightened() {return this.#frightened}
	get isWalking()    {return this.state.isWalking && !this.isFrightened}
	get isEscaping()   {return this.state.isEscaping || this.state.isReturning}
	get ignoreOneway() {return this.isFrightened || this.isEscaping}

	/**
	 @param {Direction} dir
	 @param {{type?:number, tile?:xyList, align?:-1|0|1}} cfg
	*/
	constructor(dir=L, {type=0,tile:[col,row]=[0,0],align=0}={}) {
		super(col,row)
		this.on({
			FrightMode:   this.#setFrightMode,
			Reverse: ()=> this.#revSignal = true,
			FleeTime:()=> this.#fleeTime  = 400/Game.interval,
		})
		this.dir   = dir
		this.type  = type
		this.init  = freeze({align,x:col*T})
		this.state = freeze(new Sys.GhostState(this))
	}
	get originalTargetTile() {
		return this.state.isEscaping
			? Maze.House.EntranceTile
			: this.isScattering
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
		return Vec2.sqrMag(this, player.pos)
	}
	get speed() {
		return function(g,{state:s}=g) {
			if (s.isIdle)       return GhsSpeed.Idle
			if (s.isGoingOut)   return GhsSpeed.GoOut
			if (g.isEscaping)   return GhsSpeed.Escape
			if (g.inTunSide)    return GhsSpeed.InTunnel
			if (g.isFrightened) return GhsSpeed.Fright
			if (g.isScattering) return GhsSpeed.Base
			return g.chaseSpeed
		}(this) * Game.moveSpeed
	}
	draw() {
		if (State.isIntro) return
		Ctx.save()
		this.#fadeIn.apply(this.maxAlpha)
		this.sprite.draw(this)
		Ctx.restore()
	}
	update() {
		this.#fadeIn.update(this.maxAlpha)
		this.sprite.update()
		this.houseEntranceArrived
			? this.#enterHouse()
			: State.isInGame && this.#update()
	}
	#update() {
		this.#fleeTime >= 0 && this.#fleeTime--
		if (Timer.frozen && !this.isEscaping) return
		switch(this.state.current) {
		case 'Idle':     return this.#idleInHouse(this)
		case 'GoingOut': return this.#goingOut(this)
		case 'Returning':return this.#returnToHome(this)
		default: this.#walkPath(this.speed*2|0)
		}
	}
	#idleInHouse({type,orient,center:{y:cy}}=this) {
		if (!Ctrl.alwaysChase)
			Sys.DotCounter.releaseIfReady(type, g=> this.leaveHouse(g))
		!this.state.isGoingOut && this.move(
			(cy > Maze.House.MiddleY-T/2 && orient != D)? U:
			(cy < Maze.House.MiddleY+T/2 ? D:U)
		)
	}
	leaveHouse(deactivateGlobalDotCnt=false) {
		player.resetTimer()
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
	#walkPath(steps=1) {
		for (const _ of range(steps)) {
			this.setNextPos(this.speed/steps)
			this.passedTileCenter && this.#setNextDir()
			if (this.#makeTurn(this)) break
			if (this.collidesWith())  break
		}
	}
	#setNextDir() {
		if (this.#revSignal) {
			this.#revSignal = false
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
			return this.revOrient != dir
				&& Maze.hasWall(test) == false
				&& this.#canEnterTile({dir,test})
				? [{idx,dir,dist:Vec2.sqrMag(test,tgt)}]:[]
		})
		return this.isFrightened? randChoice(dirs).dir:
			(idx=> dirs.sort(compareDist)[idx].dir)
				(this.#fleeTime >= 0 ? dirs.length-1:0)
	}
	/** @param {{dir:Direction,test:Vec2}} testTile */
	#canEnterTile({dir,test:{hyphenated:xy}}) {
		return (Ctrl.unrestricted || this.ignoreOneway)
			|| !Maze.GhostNoEntryTiles.has(xy+dir)
	}
	#makeTurn({orient}=this) {
		if (this.dir != orient
		 && this.passedTileCenter
		 && this.hasAdjWall(orient) == false) {
			this.setMoveDir(orient)
			return true
		}
		return false
	}
	collidesWith(
		pos     = player.pos,
		radius  = this.isFrightened? T/2:T/3,
		release = ()=> this.#setEscapeState(),
	) {
		if (!this.state.isWalking
		 || !this.isFrightened && Ctrl.invincible
		 || !circleCollision(this, pos, radius))
			return false
		this.isFrightened
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
		State.toPacCaught().toPacDying({delay:800})
	}
	#setFrightMode(_={}, on=false) {
		!this.isEscaping && (this.#frightened=on)
	}
	#setEscapeState() {
		Sound.ghostEscape()
		this.state.toEscaping()
	}
}