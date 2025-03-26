import {Sound}  from '../../_snd/sound.js'
import {Game}   from '../_main.js'
import {State}  from '../_state.js'
import {Ctrl}   from '../control.js'
import {PtsMgr} from '../points.js'
import {Maze}   from '../maze.js'
import {Actor}  from '../actor.js'
import {Player} from '../pacman/_pacman.js'
import Sprite   from './ghs_sprite.js'
import * as Sys from './_system.js'
import {GhsMgr} from './_system.js'

const compareDist = (a,b)=>
	(a.dist == b.dist)? (a.index-b.index) : (a.dist-b.dist)

export class Ghost extends Actor {
	#runAway    = -1
	#started    = false
	#revSig     = false
	#frightened = false
	get spriteIdx()  {return GhsMgr.spriteIdx}
	get aIdx()       {return GhsMgr.animIndex & this.playAnime}
	get maxAlpha()   {return Ctrl.showTargets ? this.cheatAlpha : 1}
	get started()    {return this.#started}
	get frightened() {return this.#frightened}
	get bitten()     {return this.state.isBitten}
	get escaping()   {return this.state.isEscaping}

	// This section is overridden in subclasses
	scatterTile = Vec2()
	get angry()     {return false}
	get chaseStep() {return GhsStep.Base}
	get chasePos()  {return Player.centerPos}
	get chaseTile() {return this.chasePos.divInt(T)}

	constructor({col=0,row=0,idx=0,initAlign=0,orient=L,playAnime=true}={}) {
		super()
		this.dir       = orient
		this.idx       = idx
		this.initX     = col*T
		this.initAlign = initAlign
		this.playAnime = playAnime
		this.pos       = Vec2(col*T, row*T)
		this.name      = this.constructor.name
		this.sprite    = new Sprite(canvas2D(null, T*3, T*2).ctx)
		this.state     = new Sys.GhostState(this)
		$(this).on('FrightMode',  this.#setFrightMode)
		$(this).on('Reverse',()=> this.#revSig  = true)
		$(this).on('Runaway',()=> this.#runAway = 400/Game.interval)
		;(this.name == 'Ghost') && freeze(this)
	}
	get isScatter() {
		return Sys.Wave.isScatter
			&& !this.frightened
			&& !this.state.isEscape
			&& !this.angry
	}
	get originalTarget() {
		return this.state.isEscape
			? Maze.PenEntrance
			: this.isScatter
				? this.scatterTile
				: this.chaseTile
	}
	get targetTile() {
		return Ctrl.unrestricted
			? this.originalTarget
			: Maze.ghostExitPos(this)
	}
	get penEntranceArrived() {
		return this.state.isEscape
			&& this.tilePos.y == Maze.PenEntrance.y
			&& abs(CvsW/2 - this.centerPos.x) <= this.step
	}
	get distanceToPacman() {
		return Vec2.distance(this, Player.pos)
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
		if (this.penEntranceArrived) {
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
			Sys.DotCounter.release(idx, this.release.bind(this))
		}
		if (!this.state.isGoOut) {
			this.dir =(cy+T*0.6-step > Maze.PenMiddleY && orient != D)
				? U : (cy-T*0.6+step < Maze.PenMiddleY ? D:U)
			this.setNextPos()
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
			return this.setMove(this.initAlign<0 ? R:L)

		if (cx != CvsW/2)
			return this.centering()

		if (y > Maze.PenEntrance.y*T+step)
			return this.setMove(U)

		this.dir = L
		this.#started ||= true
		this.state.switchToWalk()
	}
	#returnToHome({step,x,y,initX,initAlign}=this) {
		if (y+step < Maze.PenMiddleY)
			return this.setMove(D)

		if (y != Maze.PenMiddleY)
			return this.setPos({y:Maze.PenMiddleY})

		if (!initAlign || abs(x-initX) <= step) {
			this.x   = initX
			this.dir = initAlign? (initAlign<0 ? R:L) : U
			this.#arrivedAtHome()
			return
		}
		this.setMove(initAlign<0 ? L:R)
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
		if (this.dir != this.orient)
			return
		if (this.#revSig) {
			this.#revSig = false
			this.orient  = Dir.opposite(this.dir)
			return
		}
		this.orient = this.#getNextDir()
	}
	#getNextDir(target=this.targetTile) {
		const tile = this.getAdjTile(this.dir)
		const dirs = [U,L,D,R].flatMap((dir,index)=> {
			const  test = this.getAdjTile(dir,1,tile)
			const  dist = test.distance(target)
			return this.#isAllowDir(dir,test)? {index,dir,dist}:[]
		})
		return this.frightened
			? randChoice(dirs).dir
			: dirs.sort(compareDist).at(this.#runAway<0 ? 0:-1).dir
	}
	#isAllowDir(dir, tile) {
		return !Maze.hasWall(tile)
		    && !Dir.isOpposite(dir,this.orient)
		    && !this.#notEnterTile(dir,tile)
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
			this.state.switchToBitten()
			this.#frightened = false
			Sys.FrightMode.caught()
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