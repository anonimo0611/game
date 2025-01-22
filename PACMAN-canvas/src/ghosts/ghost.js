import {Sound}   from '../../_snd/sound.js'
import {Timer}   from '../../_lib/timer.js'
import {Vec2}    from '../../_lib/vec2.js'
import {Dir}     from '../../_lib/direction.js'
import {U,R,D,L} from '../../_lib/direction.js'
import {Ctx}     from '../_canvas.js'
import {Game}    from '../_main.js'
import {State}   from '../_state.js'
import {Ctrl}    from '../control.js'
import {PtsMgr}  from '../points.js'
import {Maze}    from '../maze.js'
import {Actor}   from '../actor.js'
import {PacMgr}  from '../pacman/pac.js'
import Sprite    from './ghost_sprite.js'
import * as Sys  from './_system.js'
import {GhsMgr}  from './_system.js'
import {GhsType,GhsStep,TileSize as T} from '../_constants.js'

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
	get escaping()   {return this.state.isEscaping}

	// This section is overridden in subclasses
	scatterTile = Vec2(24, 0).freeze()
	get angry()     {return false}
	get chaseStep() {return GhsStep.Base}
	get chasePos()  {return PacMgr.centerPos}
	get chaseTile() {return this.chasePos.divInt(T)}

	constructor({col=0,row=0,idx=0,initAlign=0,orient=L,anime=true}={}) {
		super()
		this.dir       = orient
		this.idx       = idx
		this.initX     = col*T
		this.initAlign = initAlign
		this.playAnime = anime
		this.pos       = Vec2(this.initX, row*T)
		this.name      = this.constructor.name
		this.sprite    = new Sprite(...canvas2D(null, T*3, T*2).vals)
		this.state     = new Sys.GhostState(this.isInHouse)
		$(this).on('FrightMode',  this.#setFrightMode)
		$(this).on('Reverse',()=> this.#revSig  = true)
		$(this).on('Runaway',()=> this.#runAway = 400/Game.interval)
		;(this.constructor.name == 'Ghost') && freeze(this)
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
		return this.tilePos.y == Maze.PenEntrance.y
			&& abs(Maze.Center - this.centerPos.x) <= this.step
	}
	get distanceToPacman() {
		return Vec2.distance(this, PacMgr.pos)
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
		if (this.state.isEscape && this.penEntranceArrived)
			this.state.switchToReturn()
		if (State.isPlaying && Maze.dotsLeft)
			this.#behavior()
	}
	#behavior() {
		const {state}= this
		this.#runAway >= 0 && this.#runAway--
		if (state.isIdle)   return this.#idle(this)
		if (state.isGoOut)  return this.#goOut(this)
		if (state.isReturn) return this.#returnToHome(this)
		this.#walk(state.isEscape)
	}
	#idle({idx,step,orient,centerPos:pos}=this) {
		if (!Ctrl.isChaseMode)
			Sys.DotCounter.release(idx, this.release.bind(this))
		if (!this.state.isGoOut) {
			this.dir =(pos.y+T*0.6-step > Maze.PenMiddleY && orient != D)
				? U : (pos.y-T*0.6+step < Maze.PenMiddleY? D : U)
			!Timer.frozen && this.setNextPos()
		}
	}
	release(deactivate_global_dot_cnt=false) {
		PacMgr.instance.resetTimer()
		this.state.isIdle && this.state.switchToGoOut()
		return deactivate_global_dot_cnt
	}
	#goOut({y,centerPos,step}=this) {
		if (Timer.frozen) return
		if (centerPos.x < Maze.Center-step
		 || centerPos.x > Maze.Center+step) {
			this.dir = this.initAlign<0 ? R:L
			this.setNextPos()
			return
		}
		if (centerPos.x != Maze.Center) {
			this.setCenterX(Maze.Center)
			return
		}
		if (y > Maze.PenEntrance.y*T+step) {
			this.dir = U
			this.setNextPos()
			return
		}
		this.dir = L
		this.#started ||= true
		this.state.switchToWalk()
	}
	#returnToHome({step,x,y,initX,initAlign}=this) {
		if (y+step <= Maze.PenMiddleY) {
			this.dir = D
			this.setNextPos()
			this.setCenterX(Maze.Center)
			return
		}
		if (this.y != Maze.PenMiddleY) {
			this.y = Maze.PenMiddleY
			return
		}
		if (!initAlign || abs(x-initX) <= step) {
			this.x   = initX
			this.dir = initAlign? (initAlign<0 ? R:L) : U
			this.#arrivedAtHome()
		 	return
		}
		this.dir = initAlign<0 ? L:R
		this.setNextPos()
	}
	#arrivedAtHome() {
		this.sprite.setResurrect()
		;(Ctrl.isChaseMode || this.idx == GhsType.Akabei)
			? this.state.switchToGoOut()
			: this.state.switchToIdle() && this.#idle(this)
		!Timer.frozen && Sound.ghostArrivedAtHome()
	}
	#walk(isEscape=false) {
		if (Timer.frozen && !isEscape) return
		for (let i=0,denom=ceil(this.step); i<denom; i++) {
			this.setNextPos(denom)
			this.inBackwardOfTile && this.#setNextDir()
			this.#setTurn(this)
		}
	}
	#setNextDir() {
		if (this.dir != this.orient) return
		if (this.#revSig) {
			this.#revSig = false
			this.orient = Dir.opposite(this.dir)
			return
		}
		this.orient = this.#getNextDir(this.targetTile)
	}
	#getNextDir(target) {
		const testTile  = this.getAdjTile(this.dir)
		const allowDirs = [U,L,D,R].flatMap((dir,index)=> {
			const tile = this.getAdjTile(dir,1,testTile)
			const dist = tile.distance(target)
			return this.#isAllowDir(dir,tile) ? {index,dir,dist} : []
		})
		return this.frightened
			? randChoice(allowDirs).dir
			: allowDirs.sort(compareDist).at(this.#runAway<0 ? 0 : -1).dir
	}
	#isAllowDir(dir, tile) {
		return(!Maze.hasWall(tile)
		    && !Dir.isOpposite(dir,this.orient)
		    && !this.#notEnterTile(dir,tile) )
	}
	#notEnterTile(dir, {x, y}) {
		return !Ctrl.unrestricted
			&& (this.state.isWalk && !this.frightened)
			&& (dir == U)
			&& Maze.GhostNotEnterSet.has(`${x}-${y}`)
	}
	#setTurn({dir,orient,pos,tilePos:t}=this) {
		if (dir == orient || this.hasAdjWall(orient)) return
		if (dir == L && pos.x < t.x*T
		 || dir == R && pos.x > t.x*T
		 || dir == U && pos.y < t.y*T
		 || dir == D && pos.y > t.y*T) {
			this.movDir = this.orient
			this.pos = this.tilePos.mul(T)
		}
	}
	#setFrightMode(_, bool) {
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
			State.isPlaying && Sound.play('bitten')
		} else {
			if (Ctrl.invincible) return
			Sound.stopLoops()
			State.isPlaying && State.switchToLosing()
		}
	}
	#setEscape() {
		Sound.ghostEscape()
		this.state.switchToEscape()
	}
}