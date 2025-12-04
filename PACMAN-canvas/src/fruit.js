import {Sound}  from '../_snd/sound.js'
import {Rect}   from '../_lib/rect.js'
import {Game}   from './_main.js'
import {$Level} from './_main.js'
import {State}  from './state.js'
import {Maze}   from './maze.js'
import {PtsMgr} from './points.js'
import {Player} from './player/player.js'
import {player} from './player/player.js'
import * as Pts from './sprites/points.js'
import * as Spr from './sprites/fruits.js'

/** The fruit appear after 70 or 170 dots are cleared
 @type {ReadonlySet<number>}
*/const AppearDots = new Set([70,170])

const TypeTable = freeze([0,1,2,2,3,3,4,4,5,5,6,6,7])
const TargetPos = Vec2.new(BW/2, T*18.5).freeze()

const Size = T*2
const LvCounterCols = 7
const LvCounterRect = new Rect(Size*6, BH-Size, Size*LvCounterCols, Size).freeze()

const FadeDur = 300
let  _showTgt = true
let  _fadeOut = /**@type {?FadeOut}*/(null)

export const Fruit = new class {
	static {$(this.setup)}
	static setup() {
		State .on({_Ready: Fruit.#resetTarget})
		Player.on({AteDot: Fruit.#onDotEaten})
		$Level.on({change: Fruit.#setImages})
	}
	get points() {
		return Pts.FruitPts[Fruit.number()]
	}
	number(i=Game.level-1) {
		return TypeTable.at((i>=TypeTable.length)? -1:i) ?? 0
	}
	/** Disappearing is between 9 and 10 seconds */
	#setHideTimer() {
		const delay = randInt(9e3, 1e4-FadeDur)/Game.speed
		Timer.set(delay, Fruit.#setFadeOut, {key:Fruit})
	}
	#resetTarget() {
		_fadeOut = null
		_showTgt = State.isTitle
	}
	#setFadeOut() {
		_fadeOut = new FadeOut(FadeDur/Game.speed)
	}
	#onDotEaten() {
		if (AppearDots.has(Maze.MaxDot - Maze.dotsLeft)) {
			_showTgt = true
			Fruit.#setHideTimer()
		}
	}
	intersectsWith(pos=player.center) {
		if (_showTgt && circleCollision(pos,TargetPos,T/2)) {
			Fruit.#resetTarget()
			Timer.cancel(Fruit) && Sound.play('fruit')
			PtsMgr.set({key:Fruit, dur:2e3, pos:TargetPos})
		}
	}
	update() {
		_fadeOut?.update() == false
			? Fruit.#resetTarget()
			: Fruit.intersectsWith()
	}
	drawTarget() {
		if (!State.isTitle
		 && !State.isInGame)
			return
		if (_showTgt && !Ticker.paused) {
			Ctx.save()
			Ctx.setAlpha(_fadeOut?.alpha)
			Ctx.translate(...TargetPos.vals)
			Ctx.drawImage(Spr.current, -T,-T)
			Ctx.restore()
		}
		PtsMgr.drawFruitPts()
	}
	drawLevelCounter() {
		const [x,y,w,h] = LvCounterRect.vals
		Ctx.drawImage(HUD.cvs, x,y, w,h, x,y, w,h)
	}
	#setLevelCounter() {
		const {ctx} = HUD, [x,y,w,h]=LvCounterRect.vals
		const begin = max(Game.level-LvCounterCols, 0)
		ctx.save()
		ctx.translate(x, y)
		ctx.clearRect(0,0,w,h)
		for (const i of range(begin, Game.level))
			Spr.draw(ctx, Fruit.number(i), w-T-Size*(i-begin), T)
		ctx.restore()
	}
	#setImages() {
		Spr.cache(Fruit.number())
		Fruit.#setLevelCounter()
	}
}