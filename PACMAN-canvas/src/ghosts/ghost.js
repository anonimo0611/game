import {Sound}  from '../../_snd/sound.js'
import {Dir}    from '../../_lib/direction.js'
import {Game}   from '../_main.js'
import {State}  from '../state.js'
import {Cfg}    from '../env.js'
import {Maze}   from '../maze.js'
import  Sprite  from '../sprites/ghost.js'
import * as Sys from './_system.js'
import {Spd,Evt,PtsMgr} from './_system.js'
import {Actor,player,Ghosts} from '../actors.js'

/**@type {readonly Direction[]}*/
const TurnPriority = [U,L,D,R]

export class Ghost extends Actor {
	/** @readonly */type
	/** @readonly */init
	/** @readonly */state
	/** @readonly */path   = new Sys.Paths()
	/** @readonly */sprite = new Sprite(Fg,T*2)

	#fleeTmr    = -1
	#revSig     = false
	#started    = false
	#frightened = false

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
		 [Evt.Ready]:    ()=> this.fadeSpr  = Fade.in(),
		 [Evt.RoundEnds]:()=> this.fadeSpr  = Fade.out(),
		 [Evt.Reverse]:  ()=> this.#revSig  = true,
		 [Evt.FleeStart]:()=> this.#fleeTmr = Sys.FLEE_TIME,
		 [Evt.Frighten]: (_, on=true)=> this.#frighten(on),
		})
	}
	get animIdx()      {return Ghosts.animIndex}
	get spriteIdx()    {return Ghosts.spriteIdx}
	get maxAlpha()     {return Cfg.showTargets? Actor.CHEAT_ALPHA:1}
	get isStarted()    {return this.#started}
	get isFrightened() {return this.#frightened}
	get isEscaping()   {return this.state.isEyes}
	get isChasingPac() {return this.getTargetTile().eq(player.tile)}

	// Getters in this section can be overridden.
	get chaseOffset()  {return 0}
	get chaseSpeed()   {return Spd.Base}
	get chasePos()     {return player.center}
	get chasingTile()  {return this.chasePos.divInt(T)}
	get scatterTile()  {return Vec2.Zero}
	get isAngry()      {return false}
	get isNormal()     {return !this.isFrightened  && this.state.isWalking}
	get isChasing()    {return Ghosts.isChasing    && this.isNormal}
	get isScattering() {return Ghosts.isScattering && this.isNormal}

	get baseTargetTile() {
		return this.state.isEscaping
			? Maze.House.EntryTile
			: this.isScattering
				? this.scatterTile
				: this.chasingTile
	}
	get speed() {
		return function(g,{state:s}=g) {
			if (s.isIdle)       return Spd.Idle
			if (s.isGoingOut)   return Spd.GoOut
			if (g.isEscaping)   return Spd.Escape
			if (g.inTunSide)    return Spd.InTunnel
			if (g.isFrightened) return Spd.Fright
			if (g.isScattering) return Spd.Base
			return g.chaseSpeed
		}(this) * Game.moveSpeed
	}
	getTargetTile(tile=this.tile) {
		return Maze.getGhostExitTile(this, tile)
	}
	draw() {
		if (State.isNewGame) return
		this.sprite.draw(this)
	}
	update() {
		this.sprite.update()
		this.fadeSpr?.update(this.maxAlpha)
		State.isInGame && this.#updateMovement()
	}
	#updateMovement() {
		if (this.#fleeTmr >= 0)
			this.#fleeTmr -= Game.interval
		if (Timer.frozen && !this.isEscaping)
			return
		switch(this.state.current) {
		case 'Idle':     return this.#idleInHouse(this)
		case 'GoingOut': return this.#goingOut(this)
		case 'Entering': return this.#enteringToHome(this)
		default: this.#moveSteps(this.speed+.5|0)
		}
	}
	#idleInHouse({orient,center:{y:cy}}=this) {
		if (!Cfg.alwaysChase)
			Sys.DotCounter.releaseIfReady(this)
		!this.state.isGoingOut && this.move(
			(cy > Maze.House.MID_Y-T/2 && orient != D)? U:
			(cy < Maze.House.MID_Y+T/2 ? D:U)
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
	}
	#enterHouse() {
		this.dir = D
		this.centering()
		this.state.setEntering()
	}
	#enteringToHome({init,speed:spd,x,y}=this) {
		const {House}= Maze
		if (y+spd < House.MID_Y)
			return this.move()

		if (y != House.MID_Y)
			return this.pos.setY(House.MID_Y).void()

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
		this.type == GhostType.Akabei || Cfg.alwaysChase
			? this.state.setGoingOut()
			: this.state.setIdle()
		!Timer.frozen && Sound.onGhostReturned()
	}
	#moveSteps(steps=1) {
		for (let i=0; i<steps; i++) {
			this.#tickMove(this.speed/steps)
			this.passedTileCenter && this.#setNextDir()
			if (this.#makeTurn())     break
			if (this.collidesWith())  break
		}
	}
	#tickMove(spd=this.speed) {
		!Maze.House.arrived(this, spd)
			? this.setNextPosition(spd)
			: this.#enterHouse()
	}
	#setNextDir() {
		if (this.#revSig) {
			this.#revSig = false
			this.orient  = this.revDir
		}
		if (this.aligned)
			this.orient = this.getNextDir()
	}
	getNextDir(
		currDir = this.dir,
		srcTile = this.getAdjacentTile(currDir),
		tgtTile = this.getTargetTile()
	) {
		const dirs = TurnPriority.flatMap((dir,i)=> {
			const testTile = this.getAdjacentTile(dir,srcTile)
			return Dir.Opposite[currDir] != dir
				&& !Maze.hasWall(testTile)
				&& !this.#isRestrictedTile({dir,testTile})
				? [{dir,i,m:Vec2.sqrMag(testTile,tgtTile)}]:[]
		})
		return this.isFrightened? randChoice(dirs).dir:
			(i=> dirs.sort((a,b)=> a.m-b.m || a.i-b.i)[i].dir)
				(this.#fleeTmr >= 0 ? dirs.length-1:0)
	}
	/** @param {{dir:Direction,testTile:Vec2}} testTile */
	#isRestrictedTile({dir,testTile:{hyphenated:xy}}) {
		const ignore = (this.isFrightened || this.isEscaping)
		return (Cfg.unrestricted || ignore)
			? false : Maze.GhostNoEntryTiles.has(xy+dir)
	}
	#makeTurn() {
		if (this.aligned == false
		 && this.passedTileCenter
		 && this.hasAdjacentWall(this.orient) == false) {
			this.alignDirection()
			return true
		}
		return false
	}
	collidesWith(
		pos     = player.pos,
		radius  = Sys.HitRadii[+this.isFrightened],
		release = ()=> this.#startEscaping(),
	) {
		if (!this.state.isWalking
		 || !this.isFrightened && Cfg.invincible
		 || !circleCollision(this, pos, radius))
			return false
		this.isFrightened
			? this.#onBitten(this.center, release)
			: Maze.dotsLeft > 0 && this.#onPacCaught()
		return true
	}
	#onBitten(pos=Vec2.Zero, cb=()=>{}) {
		this.#frightened = false
		this.state.setBitten()
		Sound.playBitesGhost()
		PtsMgr.set({pts:Sys.Points, frozen:true, ...pos, cb})
	}
	#onPacCaught() {
		Sound.stopLoops()
		State.setRoundEnds()
	}
	#frighten(on=true) {
		!this.isEscaping && (this.#frightened=on)
	}
	#startEscaping() {
		Sound.switchToEyesEscaping()
		this.state.setEscaping()
	}
}