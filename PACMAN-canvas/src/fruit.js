import {Sound}  from '../_snd/sound.js'
import {Rect}   from '../_lib/rect.js'
import {Game}   from './_main.js'
import {Level}  from './_main.js'
import {State}  from './state.js'
import {Maze}   from './maze.js'
import {PtsMgr} from './points.js'
import * as Spr from './sprites/fruits.js'
import {player,onPlayerDotEaten} from './player/player.js'

const FadeOutDur = 300
const AppearDots = new Set([70,170])
const TargetPos  = new Vec2(BW/2, T*18.5).fixed
const FruitTable = /**@type {const}*/([0,1,2,2,3,3,4,4,5,5,6,6,7])
const PointTable = /**@type {const}*/([100,300,500,700,1e3,2e3,3e3,5e3])

const Size = T*2
const LevelsCols = 7
const LevelsRect = new Rect(Size*6, BH-Size, LevelsCols*Size, Size).freeze()

let showTgt = true
let fadeOut = /**@type {?Fade}*/(null)

export const FruitMgr = new class FruitManager {
	static {$(this.setup)}
	static setup() {
		Level.on({change:FruitMgr.#setImages})
		State.on({_Ready:FruitMgr.#resetTarget})
		onPlayerDotEaten(FruitMgr.#onDotEaten)
	}
	get currType()   {return this.#getType(Game.level-1)}
	get pointType()  {return PointType.Fruit}
	get pointValue() {return PointTable[this.currType]}
	get showTarget() {return (State.isTitle || State.isInGame) && showTgt}

	#getType(/**@type {number}*/i) {
		if (i < 0) throw RangeError('Must be zero or greater.')
		return FruitTable.at( min(i, FruitTable.length-1) ) ?? 0
	}
	#resetTarget() {
		fadeOut = null
		showTgt = State.isTitle
	}
	#onEaten() {
		this.#resetTarget()
		Timer.cancel(this)
		Sound.playEatenFruit()
		PtsMgr.set({key:this, dur:2e3, pos:TargetPos})
	}
	#onDotEaten = ()=> {
		if (AppearDots.has(Maze.MaxDot - Maze.dotsLeft)) {
			showTgt = true
			this.#setHideTimer()
		}
	}
	#setHideTimer() {
		// Disappearing is between 9 and 10 seconds
		const delay = randInt(9e3, 1e4-FadeOutDur)/Game.speed
		Timer.set(delay, this.#setFadeOut, {key:this})
	}
	#setFadeOut() {
		fadeOut = Fade.out(FadeOutDur/Game.speed)
	}
	#intersectsWithPlayer() {
		return this.showTarget
			&& circleCollision(player.center, TargetPos, T/2)
	}
	update() {
		fadeOut?.update() == false
			? this.#resetTarget()
			: this.#intersectsWithPlayer() && this.#onEaten()
	}
	drawTarget() {
		if (Ticker.paused)
			return
		if (this.showTarget)
			Spr.cache.draw(Fg, TargetPos, fadeOut?.alpha)
		PtsMgr.drawFruitPts()
	}
	drawLevelCounter() {
		const [x,y,w,h] = LevelsRect.vals
		Fg.drawImage(HUD.canvas, x,y,w,h, x,y,w,h)
	}
	#setLevelCounter() {
		const [x,y,w,h]  = LevelsRect.vals
		const startLevel = max(Game.level-LevelsCols, 0)
		HUD.save()
		HUD.clearRect(x,y,w,h)
		HUD.translate(x,y)
		for (let i=startLevel; i<Game.level; i++)
			Spr.draw(HUD, this.#getType(i), w-T-Size*(i-startLevel))
		HUD.restore()
	}
	#setImages = ()=> {
		Spr.cache.update(this.currType)
		this.#setLevelCounter()
	}
}