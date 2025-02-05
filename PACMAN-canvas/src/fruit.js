import {Sound}  from '../_snd/sound.js'
import {Ticker} from '../_lib/timer.js'
import {Timer}  from '../_lib/timer.js'
import {Vec2}   from '../_lib/vec2.js'
import {Game}   from './_main.js'
import {State}  from './_state.js'
import {Maze}   from './maze.js'
import {PtsMgr} from './points.js'
import {Player} from './pacman/_pacman.js'
import Sprites  from './fruits_sprite.js'
import {CvsW,Bg,Ctx,DotMax,TileSize as T} from './_constants.js'

// The fruit appear after 70 or 170 dots are cleared
const appearSet  = new Set([70,170])
const LevelTable = freeze([0,1,2,2,3,3,4,4,5,5,6,6,7])
const PointTable = freeze([100,300,500,700,1e3,2e3,3e3,5e3])

const LvCounterMax  = 7
const LvCounterRect = freeze([T*12, T*32, T*2*LvCounterMax, T*2])

/** @type {?FadeOut} */
let _fadeOut = null
let _tgtDisp = true

export const Fruit = new class {
	static {$ready(this.setup)}
	static setup() {
		$on('Title Ready',  Fruit.#reset)
		$on('LevelChanged', Fruit.#drawLevelCounter)
		Player.bindDotEaten(Fruit.#dotEaten)
	}
	get score() {
		return PointTable[Fruit.number()]
	}
	get targetPos() {
		return Vec2(CvsW/2, T*18.5)
	}
	number(i=Game.level-1) {
		return LevelTable.at(i >= LevelTable.length ? -1 : i)
	}
	#reset() {
		_fadeOut = null
		_tgtDisp = State.isTitle
	}
	#dotEaten() {
		if (!appearSet.has(DotMax - Maze.dotsLeft)) return
		_tgtDisp = true
		// The fruit disappearing is between 9 and 10 seconds
		const {speedRate:rate}=Game, fadeDur=300
		Timer.set(randInt(9e3, 1e4-fadeDur)/rate,
			()=> _fadeOut = new FadeOut(fadeDur/rate), {key:Fruit})
	}
	#collideWith(pos=Player.centerPos) {
		if (!collisionCircle(pos, Fruit.targetPos, T/2)) return
		_tgtDisp = false
		Timer.cancel(Fruit) && Sound.play('fruit')
		PtsMgr.set({key:Fruit, delay:2e3, ...Fruit.targetPos})
	}
	update() {
		_fadeOut?.update()
		if (_fadeOut?.working === false) {
			_fadeOut = null
			_tgtDisp = false
		}
		_tgtDisp && Fruit.#collideWith()
	}
	drawTarget() {
		if (!State.isTitle && !State.isPlaying) return
		if (!Ticker.paused && _tgtDisp)
			Fruit.#drawSprite(Ctx, Fruit.number(), Fruit.targetPos)
	}
	#drawSprite(ctx=Ctx, idx, {x, y}) {
		ctx.save()
		_fadeOut?.setAlpha(ctx)
		ctx.translate(x, y)
		ctx.scale(T/8*1.05, T/8*1.05)
		Sprites[idx](ctx)
		ctx.restore()
	}
	drawLevelCounter() {
		const [x,y,w,h] = LvCounterRect;
		Ctx.drawImage(Bg.cvs, x,y, w,h, x,y, w,h)
	}
	#drawLevelCounter() {
		const [x,y,w,h] = LvCounterRect
		const initCount = max(Game.level-LvCounterMax, 0)
		Bg.ctx.clearRect(x,y,w,h)
		for (let i=initCount,cols=1; i<Game.level; i++) {
			const pos = Vec2(x+w+T-(T*2*cols++), y+T)
			Fruit.#drawSprite(Bg.ctx, Fruit.number(i), pos)
		}
	}
}