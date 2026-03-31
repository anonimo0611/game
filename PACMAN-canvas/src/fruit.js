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
const TargetPos  = new ReadonlyXY(BW/2, T*18.5)
const FruitTable = /**@type {const}*/([0,1,2,2,3,3,4,4,5,5,6,6,7])
const PointTable = /**@type {const}*/([100,300,500,700,1e3,2e3,3e3,5e3])

const LevelsCols = 7
const LevelsRect = new Rect(T*12, BH-T*2, T*2*LevelsCols, T*2).freeze()

let showTgt = true
let fadeOut = /**@type {?Fade}*/(null)

export const Fruit = new class {
	static {$(this.setup)}
	static setup() {
		Level.on({change:Fruit.#setImages})
		State.on({_Ready:Fruit.#resetTarget})
		onPlayerDotEaten(Fruit.#onDotEaten)
	}
	get currentType() {
		return Fruit.#getType(Game.level-1)
	}
	get points() {
		return PointTable[Fruit.currentType]
	}
	get showTarget() {
		return (State.isTitle || State.isInGame) && showTgt
	}
	get intersectsWithPlayer() {
		return circleCollision(player.center, TargetPos, T/2)
	}
	#getType(/**@type {number}*/i) {
		if (i < 0) throw RangeError('Must be zero or greater.')
		return FruitTable.at( min(i, FruitTable.length-1) ) ?? 0
	}
	#setHideTimer() {
		// Disappearing is between 9 and 10 seconds
		const delay = randInt(9e3, 1e4-FadeOutDur)/Game.speed
		Timer.set(delay, Fruit.#setFadeOut, {key:Fruit})
	}
	#resetTarget() {
		fadeOut = null
		showTgt = State.isTitle
	}
	#setFadeOut() {
		fadeOut = Fade.out(FadeOutDur/Game.speed)
	}
	#onDotEaten() {
		if (AppearDots.has(Maze.MaxDot - Maze.dotsLeft)) {
			showTgt = true
			Fruit.#setHideTimer()
		}
	}
	#checkIntersects() {
		if (Fruit.showTarget && Fruit.intersectsWithPlayer) {
			Fruit.#resetTarget()
			Timer.cancel(Fruit) && Sound.playEatenSE()
			PtsMgr.set({key:Fruit, dur:2e3, pos:TargetPos})
		}
	}
	update() {
		fadeOut?.update() == false
			? Fruit.#resetTarget()
			: Fruit.#checkIntersects()
	}
	drawTarget() {
		if (Ticker.paused) return
		if (Fruit.showTarget) {
			Spr.Cache.draw(Fg, TargetPos, fadeOut?.alpha)
		}
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
		for (const i of range(startLevel, Game.level))
			Spr.draw(HUD, Fruit.#getType(i), w-T-T*2*(i-startLevel))
		HUD.restore()
	}
	#setImages() {
		Spr.Cache.update(Fruit.currentType)
		Fruit.#setLevelCounter()
	}
}