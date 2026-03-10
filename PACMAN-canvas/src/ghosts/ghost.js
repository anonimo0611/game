import {Sound}   from '../../_snd/sound.js'
import {Dir}     from '../../_lib/direction.js'
import {Game}    from '../_main.js'
import {State}   from '../state.js'
import {Ctrl}    from '../control.js'
import {PtsMgr}  from '../points.js'
import {Maze}    from '../maze.js'
import {Actor}   from '../actor.js'
import {player}  from '../player/player.js'
import {PathMgr} from './show_path.js'
import Sprite    from '../sprites/ghost.js'
import * as Sys  from './_system.js'
import {GhsMgr,Evt} from './_system.js'

/**@type {readonly Direction[]}*/
const TurnPriority = [U,L,D,R]

export class Ghost extends Actor {
	/** @readonly */type
	/** @readonly */init
	/** @readonly */state
	/** @readonly */pathMgr = new PathMgr()
	/** @readonly */sprite  = new Sprite(Fg)

	#fader = /**@type {?Fade}*/(null)
	#fleeTmr    = -1
	#revSig     = false
	#started    = false
	#frightened = false

	get chaseOffset() {return 0}
	get chaseSpeed()  {return GhsSpeed.Base}
	get chasePos()    {return player.center}
	get scatterTile() {return Vec2.new(24, 0)}
	get chaseTile()   {return this.chasePos.divInt(T)}

	/**
	 @param {Direction} dir
	 @param {{type?:number, tile?:xyTuple, align?:-1|0|1}} options
	*/
	constructor(dir=L, {type=0,tile:[col,row]=[0,0],align=0}={}) {
		super(col,row)
		this.dir   = dir
		this.type  = type
		this.init  = freeze({align,x:col*T})
		this.state = Sys.createState(this)
		$(this).on({
		 [Evt.Reverse]:  ()=> this.#revSig  = true,
		 [Evt.Ready]:    ()=> this.#fader   = Fade.in(),
		 [Evt.RoundEnds]:()=> this.#fader   = Fade.out(),
		 [Evt.FleeStart]:()=> this.#fleeTmr = 400/Game.interval,
		 [Evt.Frighten]: (_,on=true)=> this.#frighten(on),
		})
	}
	get animIdx()      {return GhsMgr.animIndex}
	get spriteIdx()    {return GhsMgr.spriteIdx}
	get isChasing()    {return GhsMgr.isChaseMode   && this.isNormal}
	get isScattering() {return GhsMgr.isScatterMode && this.isNormal}

	get alpha()        {return this.#fader?.alpha ?? this.maxAlpha}
	get maxAlpha()     {return Ctrl.showTargets? .75:1}

	get isAngry()      {return false}
	get isEscaping()   {return this.state.isEscapingEyes}
	get isTargetPac()  {return this.targetTile.eq(player.tilePos)}
	get isStarted()    {return this.#started}
	get isFrightened() {return this.#frightened}
	get isNormal()     {return!this.#frightened  && this.state.isWalking}
	get hasFixedTgt()  {return this.isScattering || this.state.isEscaping}

	get baseTargetTile() {
		return this.state.isEscaping
			? Maze.House.EntryTile
			: this.isScattering
				? this.scatterTile
				: this.chaseTile
	}
	get targetTile() {
		return Ctrl.unrestricted
			? this.baseTargetTile
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
		this.sprite.draw(this)
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
			if (this.#makeTurn(this)) break
			if (this.collidesWith())  break
			this.#tickMove(this.speed/steps)
			this.passedTileCenter && this.#setNextDir()
		}
	}
	#tickMove(spd=this.speed) {
		this.pathMgr.update(this)
		!Maze.House.arrived(this, spd)
			? this.setNextPos(spd)
			: this.#enterHouse()
	}
	#idleInHouse({orient,center:{y:cy}}=this) {
		!Ctrl.alwaysChase &&
			Sys.DotCounter.releaseIfReady(this)
		!this.state.isGoingOut && this.move(
			(cy > Maze.MidY - (T*0.6) && orient != D)? U:
			(cy < Maze.MidY + (T*0.5) ? D:U)
		)
	}
	leaveHouse = (deactivateGlobalDotCnt=false)=> {
		player.resetTimer()
		this.#started ||= true
		this.state.isIdle &&
		this.state.setGoingOut()
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
		this.state.setWalking()
		this.pathMgr.update(this)
	}
	#enterHouse() {
		this.dir = D
		this.centering()
		this.state.setReturning()
	}
	#returnToHome({init,speed:spd,x,y}=this) {
		if (y+spd < Maze.MidY)
			return this.move()

		if (y != Maze.MidY)
			return this.pos.setY(Maze.MidY).void()

		if (!init.align || abs(x-init.x) <= spd) {
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
			? this.state.setGoingOut()
			: this.state.setIdle()
		!Timer.frozen && Sound.onGhostReturned()
	}
	#setNextDir() {
		if (this.#revSig) {
			this.#revSig = false
			this.orient = this.revDir
		}
		if (this.dir == this.orient)
			this.orient = this.getNextDir()
	}
	getNextDir(
		cDir = this.dir,
		tile = this.getAdjTile(this.dir)
	) {
		const dirs = TurnPriority.flatMap((dir,i)=> {
			const test = this.getAdjTile(dir,tile)
			return Dir.Opposite[cDir] != dir
				&& !Maze.hasWall(test)
				&& !this.#isRestrictedTile({dir,test})
				? [{dir,i,m:Vec2.sqrMag(test,this.targetTile)}]:[]
		})
		return this.isFrightened? randChoice(dirs).dir:
			(i=> dirs.sort((a,b)=> a.m-b.m || a.i-b.i)[i]?.dir)
				(this.#fleeTmr >= 0 ? dirs.length-1:0) ?? cDir
	}
	/** @param {{dir:Direction,test:Vec2}} testTile */
	#isRestrictedTile({dir,test:{hyphenated:xy}}) {
		const ignore = (this.isFrightened || this.isEscaping)
		return (Ctrl.unrestricted || ignore)
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
		pos     = player.pos,
		radius  = T*(this.isFrightened? .5 : .4),
		release = ()=> this.#setEscapeState(),
	) {
		if (!this.state.isWalking
		 || !this.isFrightened && Ctrl.invincible
		 || !circleCollision(this, pos, radius))
			return false
		this.isFrightened
			? this.#setBittenState(release)
			: this.#setPacDyingState()
		return true
	}
	#setBittenState(release=()=>{}) {
		Sound.playBittenSE()
		this.#frightened = false
		this.state.setBitten()
		Timer.freeze()
		PtsMgr.set({key:GhsMgr, pos:this.center}, release)
	}
	#setPacDyingState() {
		Sound.stopLoops()
		State.setPacDying()
	}
	#frighten(on=true) {
		!this.isEscaping && (this.#frightened=on)
	}
	#setEscapeState() {
		Sound.playEscapaingEyes()
		this.state.setEscaping()
	}
}