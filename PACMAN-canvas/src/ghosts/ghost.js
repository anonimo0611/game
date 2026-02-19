import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {PtsMgr} from '../points.js'
import {Maze}   from '../maze.js'
import {Actor}  from '../actor.js'
import {Player} from '../player/player.js'
import Sprite   from '../sprites/ghost.js'
import * as Sys from './_system.js'
import {GhsMgr,Evt} from './_system.js'

/** @type {readonly Direction[]} */
const TurnPriority = [U,L,D,R]

export class Ghost extends Actor {
	/** @readonly */type
	/** @readonly */init
	/** @readonly */state
	/** @readonly */sprite = new Sprite

	#fader = /**@type {?Fade}*/(null)
	#fleeTmr    = -1
	#started    = false
	#revSig     = false
	#frightened = false

	/**
	 @typedef {import('./_system').IGhsState} IState
	 @param {Direction} dir
	 @param {{type?:number, tile?:xyTuple, align?:-1|0|1}} options
	*/
	constructor(dir=L, {type=0,tile:[col,row]=[0,0],align=0}={}) {
		super(col,row)
		this.dir   = dir
		this.type  = type
		this.init  = freeze({align,x:col*T})
		this.state = /**@type {IState}*/(new Sys.GhsState(this))
		$(this).on({
		 [Evt.Reverse]:   ()=> this.#revSig  = true,
		 [Evt.Ready]:     ()=> this.#fader   = Fade.in (500),
		 [Evt.RoundEnds]: ()=> this.#fader   = Fade.out(400),
		 [Evt.FleeTime]:  ()=> this.#fleeTmr = 400/Game.interval,
		 [Evt.FrightMode]:(_,on=true)=> this.#setFrightMode(on),
		})
	}
	get animIdx()      {return GhsMgr.animIndex}
	get spriteIdx()    {return GhsMgr.spriteIdx}
	get isChasing()    {return GhsMgr.isChaseMode   && this.isNormal}
	get isScattering() {return GhsMgr.isScatterMode && this.isNormal}

	get isAngry()      {return false}
	get isStarted()    {return this.#started}
	get isFrightened() {return this.#frightened}
	get ignoreOneway() {return this.isFrightened || this.isEscaping}
	get isNormal()     {return this.state.isRoaming && !this.isFrightened}
	get isEscaping()   {return this.state.isEscapingEyes}

	get alpha()        {return this.#fader?.alpha ?? this.maxAlpha}
	get maxAlpha()     {return Ctrl.showTargets? .75:1}

	get chaseOffset()  {return 0}
	get chaseSpeed()   {return GhsSpeed.Base}
	get chasePos()     {return Player.core.center}
	get chaseTile()    {return this.chasePos.divInt(T)}
	get scatterTile()  {return Vec2.new(24, 0)}

	get originalTargetTile() {
		return this.state.isEscaping
			? Maze.House.EntryTile
			: this.isScattering
				? this.scatterTile
				: this.chaseTile
	}
	get targetTile() {
		return Ctrl.unrestricted
			? this.originalTargetTile
			: Maze.getGhostExitTile(this)
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
		this.sprite.draw(Fg,this)
	}
	update() {
		this.sprite.update()
		this.#fader?.update(this.maxAlpha)
		State.isInGame && this.#update()
	}
	#update() {
		this.#fleeTmr >= 0 && this.#fleeTmr--
		if (Timer.frozen && !this.isEscaping) return
		switch(this.state.current) {
		case 'Idle':     return this.#idleInHouse(this)
		case 'GoingOut': return this.#goingOut(this)
		case 'Returning':return this.#returnToHome(this)
		default: this.#moveStepped(this.speed+.5|0)
		}
	}
	#moveStepped(steps=1) {
		for (const _ of range(steps)) {
			this.#tickMove(this.speed/steps)
			this.passedTileCenter && this.#setNextDir()
			if (this.#makeTurn(this)) break
			if (this.collidesWith())  break
		}
	}
	#tickMove(spd=this.speed) {
		!this.#houseEntranceArrived(spd)
			? this.setNextPos(spd)
			: this.#enterHouse()
	}
	#idleInHouse({type,orient,center:{y:cy}}=this) {
		if (!Ctrl.alwaysChase)
			Sys.DotCounter.releaseIfReady(type, g=> this.leaveHouse(g))
		!this.state.isGoingOut && this.move(
			(cy > Maze.House.MiddleY-T*0.6 && orient != D)? U:
			(cy < Maze.House.MiddleY+T*0.5 ? D:U)
		)
	}
	leaveHouse(deactivateGlobalDotCnt=false) {
		Player.core.resetTimer()
		this.#started ||= true
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

		if (y > Maze.House.EntryTile.y*T)
			return this.move(U)

		this.dir = L
		this.state.toRoaming()
	}
	#houseEntranceArrived(spd=this.speed) {
		return this.state.isEscaping
			&& this.tilePos.y == Maze.House.EntryTile.y
			&& abs(BW/2 - this.center.x) <= spd
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
			: (this.state.toIdle(), this.#idleInHouse(this))
		!Timer.frozen && Sound.onGhostReturned()
	}
	#setNextDir() {
		if (this.#revSig) {
			this.#revSig = false
			this.orient = this.revDir
		}
		if (this.dir == this.orient)
			this.orient = this.#getNextDir()
	}
	#getNextDir(tgt=this.targetTile) {
		const tile = this.getAdjTile(this.dir)
		const dirs = TurnPriority.flatMap((dir,idx)=>
		{
			const testTile = this.getAdjTile(dir,tile)
			return this.revOrient != dir
				&& !Maze.hasWall(testTile)
				&& !this.#isRestrictedTile({dir,testTile})
				? [{idx,dir,dist:Vec2.sqrMag(testTile,tgt)}]:[]
		})
		return this.isFrightened? randChoice(dirs).dir:
			(idx=> dirs.sort(compareDist)[idx].dir)
				(this.#fleeTmr >= 0 ? dirs.length-1:0)
	}
	/** @param {{dir:Direction,testTile:Vec2}} testTile */
	#isRestrictedTile({dir,testTile:{hyphenated:xy}}) {
		return (Ctrl.unrestricted || this.ignoreOneway)
			? false : Maze.GhostNoEntryTiles.has(xy+dir)
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
		pos     = Player.core.pos,
		radius  = T*(this.isFrightened? .5 : .4),
		release = ()=> this.#setEscapeState(),
	) {
		if (!this.state.isRoaming
		 || !this.isFrightened && Ctrl.invincible
		 || !circleCollision(this, pos, radius))
			return false
		this.isFrightened
			? this.#setBittenState(release)
			: this.#setPacCaughtState()
		return true
	}
	#setBittenState(release=()=>{}) {
		Sound.playBittenSE()
		this.#frightened = false
		this.state.toBitten()
		Timer.freeze()
		PtsMgr.set({key:GhsMgr, pos:this.center}, release)
	}
	#setPacCaughtState() {
		Sound.stopLoops()
		State.toPacCaught()
		State.toPacDying({delay:800})
	}
	#setFrightMode(on=true) {
		!this.isEscaping && (this.#frightened=on)
	}
	#setEscapeState() {
		Sound.playEscapaingEyes()
		this.state.toEscaping()
	}
}