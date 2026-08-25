import {Sound}  from '../_snd/sound.js'
import {Rect}   from '../_lib/rect.js'
import {Game}   from './_main.js'
import {Level}  from './_main.js'
import {State}  from './state.js'
import {Maze}   from './maze.js'
import {PtsMgr} from './points.js'
import * as Spr from './sprites/fruits.js'
import {player,onPlayerDotEaten} from './actors.js'

let showTgt = true
let fadeTgt = /**@type {?Fade}*/(null)

const FADE_DUR   = 300
const LEVEL_COLS = 7
const Cache      = Spr.cache(T*2)
const AppearDots = new Set([70,170])
const TargetPos  = new Vec2(BW/2, T*18.5).fixed
const LevelsRect = new Rect(T*2*6, BH-T*2, LEVEL_COLS*T*2, T*2).freeze()

/** 0:Cherry, 1:Strwb, 2:Orange, 3:Apple, 4:Melon ,5:Gala, 6:Bell, 7:Key */
const FruitTable = /**@type {const}*/([0,1,2,2,3,3,4,4,5,5,6,6,7])
const PointTable = /**@type {const}*/([100,300,500,700,1e3,2e3,3e3,5e3])

const Types = {
	get current() {return this.get(Game.level-1)},
	get:(i=0)=> FruitTable[mathClamp(i, 0, FruitTable.length-1)],
}
const Points = {
	get type()  {return PointType.Fruit},
	get value() {return PointTable[Types.current]},
}

export const Fruits = new class FruitGroup {
	static {$(this.setup)}
	static setup() {
		Level.on({change:Fruits.#setImages})
		State.on({_Ready:Fruits.#resetTarget})
		onPlayerDotEaten(Fruits.#onDotEaten)
	}
	get showTarget() {
		return (State.isTitle || State.isInGame) && showTgt
	}
	get intersectsWithPlayer() {
		return this.showTarget
			&& circleCollision(player.center, TargetPos, T/2)
	}
	#resetTarget() {
		fadeTgt = null
		showTgt = State.isTitle
	}
	#onDotEaten() {
		if (!AppearDots.has(Maze.MaxDot - Maze.dotsLeft)) return
		showTgt = true
		Timer.set(// Disappearing is between 9 and 10 seconds
			randInt(9e3, 1e4-FADE_DUR) / Game.speed,
			()=> fadeTgt=Fade.out(FADE_DUR/Game.speed), {key:this}
		)
	}
	#onEaten() {
		this.#resetTarget()
		Timer.cancel(this)
		Sound.playEatsFruit()
		PtsMgr.set({pts:Points, dur:2e3, ...TargetPos})
	}
	update() {
		fadeTgt?.update() == false
			? this.#resetTarget()
			: this.intersectsWithPlayer && this.#onEaten()
	}
	drawTarget() {
		if (Ticker.paused) return
		this.showTarget
			&& Fg.put(Cache.canvas, TargetPos, fadeTgt?.alpha)
		PtsMgr.drawFruitPts()
	}
	drawLevelCounter() {
		const [x,y,w,h] = LevelsRect.vals
		Fg.drawImage(HUD.canvas, x,y,w,h, x,y,w,h)
	}
	#setLevelCounter() {
		const [x,y,w,h]  = LevelsRect.vals
		const startLevel = max(Game.level-LEVEL_COLS, 0)
		HUD.save()
		HUD.clearRect(x,y,w,h)
		HUD.translate(x,y)
		for (let i=startLevel; i<Game.level; i++)
			Spr.draw(HUD, Types.get(i), T*2, w-T-T*2*(i-startLevel))
		HUD.restore()
	}
	#setImages() {
		Cache.update(Types.current)
		Fruits.#setLevelCounter()
	}
}