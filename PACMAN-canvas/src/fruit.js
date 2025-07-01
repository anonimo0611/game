import {Sound}  from '../_snd/sound.js'
import {Game}   from './_main.js'
import {$level} from './_main.js'
import {State}  from './state.js'
import {Maze}   from './maze.js'
import {PtsMgr} from './points.js'
import {Player} from './pacman.js'
import * as Pts from './sprites/points.js'
import * as Spr from './sprites/fruits.js'

/** The fruit appear after 70 or 170 dots are cleared
 ** @type {ReadonlySet<number>} */
const AppearSet = new Set([70,170])
const IdxTable  = freeze([0,1,2,2,3,3,4,4,5,5,6,6,7])
const TargetPos = Vec2(CW/2, T*18.5).freeze()

const LvCounterCols = 7
const LvCounterRect = freeze([T*2*6, CH-T*2, T*2*LvCounterCols, T*2])

let _tgtDisp = true
let _fadeOut = /**@type {?FadeOut}*/(null)

export const Fruit = new class {
	static {$ready(this.setup)}
	static setup() {
		State .on({Title: Fruit.#reset})
		State .on({Ready: Fruit.#reset})
		Player.on({Eaten: Fruit.#dotEaten})
		$level.on({change:Fruit.#setImages})
	}
	get score() {
		return Pts.Vals.Fruit[Fruit.number()]
	}
	number(i=Game.level-1) {
		return IdxTable.at(i >= IdxTable.length ? -1 : i) ?? 0
	}
	/** Disappearing is between 9 and 10 seconds */
	#setTimerToHideTarget() {
		const {speedRate:rate}=Game, fadeDur=300
		const setFadeOut = ()=> _fadeOut = new FadeOut(fadeDur/rate)
		Timer.set(randInt(9e3, 1e4-fadeDur)/rate, setFadeOut, {key:Fruit})
	}
	#reset() {
		_fadeOut = null
		_tgtDisp = State.isTitle
	}
	#dotEaten() {
		if (AppearSet.has(Maze.DotMax - Maze.dotsLeft)) {
			_tgtDisp = true
			Fruit.#setTimerToHideTarget()
		}
	}
	#collideWith(pos=Player.i.centerPos) {
		if (_tgtDisp && collisionCircle(pos, TargetPos, T/2)) {
			_tgtDisp = false
			Timer.cancel(Fruit) && Sound.play('fruit')
			PtsMgr.set({key:Fruit, dur:2e3, pos:TargetPos})
		}
	}
	update() {
		if (_fadeOut?.update() === false) {
			_fadeOut = null
			_tgtDisp = false
		}
		Fruit.#collideWith()
	}
	draw() {
		if ((State.isTitle || State.isPlaying)
		 && !Ticker.paused && _tgtDisp) {
			Ctx.save()
			Ctx.setAlpha(_fadeOut?.alpha)
			Ctx.translate(...TargetPos.vals)
			Ctx.drawImage(Spr.current, -T,-T)
			Ctx.restore()
		}
		PtsMgr.drawFruitPts()
	}
	drawLevelCounter() {
		const [x,y,w,h] = LvCounterRect
		Ctx.drawImage(HUD.cvs, x,y, w,h, x,y, w,h)
	}
	#setImages() {
		const {ctx} = HUD, [x,y,w,h]=LvCounterRect
		const begin = max(Game.level-LvCounterCols, 0)
		ctx.save()
		ctx.translate(x, y)
		ctx.clearRect(0,0,w,h)
		for (const i of range(begin, Game.level))
			Spr.draw(ctx, Fruit.number(i), w-T-(T*2*(i-begin)), T)
		ctx.restore()
		Spr.cache(Fruit.number())
	}
}