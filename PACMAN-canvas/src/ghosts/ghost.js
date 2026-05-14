import {Sound}   from '../../_snd/sound.js'
import {Dir}     from '../../_lib/direction.js'
import {Game}    from '../_main.js'
import {State}   from '../state.js'
import {Cfg}     from '../control.js'
import {Maze}    from '../maze.js'
import {PtsMgr}  from '../points.js'
import {Actor}   from '../actor.js'
import {player}  from '../player/player.js'
import  Sprite   from '../sprites/ghost.js'
import * as Sys  from './_system.js'
import {Ghosts}  from './_system.js'
import {PathMgr} from './paths.js'

/** @type {readonly Direction[]} */
const TurnPriority = [U,L,D,R]

export class Ghost extends Actor {
	/** @readonly */type
	/** @readonly */init
	/** @readonly */state
	/** @readonly */path   = new PathMgr()
	/** @readonly */sprite = new Sprite(Fg,T*2)

	#fader = /**@type {?Fade}*/(null)
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
		 [Sys.Evt.Reverse]:  ()=> this.#revSig  = true,
		 [Sys.Evt.Ready]:    ()=> this.#fader   = Fade.in(),
		 [Sys.Evt.RoundEnds]:()=> this.#fader   = Fade.out(),
		 [Sys.Evt.FleeStart]:()=> this.#fleeTmr = 400/Game.interval,
		 [Sys.Evt.Frighten]: (_,on=true)=> this.#frighten(on),
		})
	}
	get animIdx()      {return Ghosts.animIndex}
	get spriteIdx()    {return Ghosts.spriteIdx}
	get maxAlpha()     {return Cfg.showTargets? .75:1}
	get alpha()        {return this.#fader?.alpha ?? this.maxAlpha}
	get chaseTile()    {return this.chasePos.divInt(T)}
	get isChasingPac() {return this.getTargetTile().eq(player.tile)}

	get isStarted()    {return this.#started}
	get isEscaping()   {return this.state.isEscapingEyes}
	get isFrightened() {return this.#frightened}
	get isNormal()     {return!this.#frightened  && this.state.isWalking}
	get hasFixedTgt()  {return this.isScattering || this.state.isEscaping}

	// The getters in this section subject to overridden
	get chaseOffset()  {return 0}
	get chaseSpeed()   {return Sys.Speed.Base}
	get chasePos()     {return player.center}
	get scatterTile()  {return Vec2.new(24, 0)}
	get isAngry()      {return false}
	get isChasing()    {return Ghosts.isChasing    && this.isNormal}
	get isScattering() {return Ghosts.isScattering && this.isNormal}

	get baseTargetTile() {
		return this.state.isEscaping
			? Maze.House.EntryTile
			: this.isScattering
				? this.scatterTile
				: this.chaseTile
	}
	getTargetTile(tile=this.tile) {
		const {baseTargetTile}= this
		return Maze.getGhostExitTile({baseTargetTile,tile})
	}
	get speed() {
		return function(g,{state:s}=g) {
			if (s.isIdle)       return Sys.Speed.Idle
			if (s.isGoingOut)   return Sys.Speed.GoOut
			if (g.isEscaping)   return Sys.Speed.Escape
			if (g.inTunSide)    return Sys.Speed.InTunnel
			if (g.isFrightened) return Sys.Speed.Fright
			if (g.isScattering) return Sys.Speed.Base
			return g.chaseSpeed
		}(this) * Game.moveSpeed
	}
	draw() {
		if (State.isNewGame) return
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
		case 'Entering': return this.#enteringToHome(this)
		default: this.#moveStepped(this.speed+.5|0)
		}
	}
	#moveStepped(steps=1) {
		for (let i=0; i<steps; i++) {
			this.#tickMove(this.speed/steps)
			this.passedTileCenter && this.#setNextDir()
			if (this.#makeTurn())    break
			if (this.collidesWith()) break
		}
	}
	#tickMove(spd=this.speed) {
		!Maze.House.arrived(this, spd)
			? this.setNextPosition(spd)
			: this.#enterHouse()
	}
	#idleInHouse({orient,center:{y:cy}}=this) {
		!Cfg.alwaysChase &&
			Sys.DotCounter.releaseIfReady(this)
		!this.state.isGoingOut && this.move(
			(cy > Maze.House.MID_Y - (T*0.6) && orient != D)? U:
			(cy < Maze.House.MID_Y + (T*0.5) ? D:U)
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
	#setNextDir() {
		if (this.#revSig) {
			this.#revSig = false
			this.orient  = this.revDir
		}
		if (this.dir == this.orient)
			this.orient = this.getNextDir()
	}
	getNextDir(
		currDir = this.dir,
		srcTile = this.getAdjacentTile(),
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
		if (this.dir != this.orient
		 && this.passedTileCenter
		 && this.hasAdjacentWall() == false) {
			this.updateDirection()
			return true
		}
		return false
	}
	collidesWith(
		pos     = player.pos,
		radius  = T*(this.isFrightened? .5 : .4),
		release = ()=> this.#startEscaping(),
	) {
		if (!this.state.isWalking
		 || !this.isFrightened && Cfg.invincible
		 || !circleCollision(this, pos, radius))
			return false
		this.isFrightened
			? this.#onBitten(release)
			: Maze.dotsLeft && this.#onPacCaught()
		return true
	}
	#onBitten(cb=()=>{}) {
		Sound.playBitesGhost()
		this.#frightened = false
		this.state.setBitten()
		PtsMgr.set({key:Ghosts, pos:this.center, frozen:true, cb})
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