import {Sound}  from '../_snd/sound.js'
import {Ticker} from '../_lib/timer.js'
import {Timer}  from '../_lib/timer.js'
import {Vec2}   from '../_lib/vec2.js'
import {Game}   from './_main.js'
import {State}  from './_state.js'
import {Maze}   from './maze.js'
import {PtsMgr} from './points.js'
import {PacMgr} from './pacman/pac.js'
import Sprites  from './fruits_sprite.js'
import {Ctx,BgCvs,BgCtx} from './_canvas.js'
import {DotMax,TileSize as T} from './_constants.js'

// The fruit appear after 70 or 170 dots are cleared
const appearSet  = new Set([70,170])
const LevelTable = freeze([0,1,2,2,3,3,4,4,5,5,6,6,7])
const PointTable = freeze([100,300,500,700,1e3,2e3,3e3,5e3])
const LevelCounterRect = freeze([T*12, T*32, T*2*8, T*2])

/** @type {FadeOut|null} */
let _fadeOut = null
let _tgtDisp = true

export const Fruit = new class {
	static {$ready(this.setup)}
	static setup() {
		$on('Title Ready',  Fruit.#reset)
		$on('LevelChanged', Fruit.#drawLevelCounter)
		PacMgr.bindDotEaten(Fruit.#dotEaten)
	}
	get score() {
		return PointTable[Fruit.number()]
	}
	get targetPos() {
		return Vec2(Maze.Width/2, T*18.5)
	}
	#reset() {
		_fadeOut = null
		_tgtDisp = State.isTitle
	}
	number(i=Game.level-1) {
		return LevelTable.at(i >= LevelTable.length ? -1 : i)
	}
	#dotEaten() {
		if (!appearSet.has(DotMax - Maze.dotsLeft)) return
		_tgtDisp = true
		// The fruit disappearing is between 9 and 10 seconds
		const {speedRate:rate}=Game, fadeDur=300
		Timer.set(randInt(9e3, 1e4-fadeDur)/rate,
			()=> _fadeOut = new FadeOut(fadeDur/rate), {key:Fruit})
	}
	#collideWith(pos=PacMgr.centerPos) {
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
	#drawSprite(ctx=Ctx, idx, {x, y}) {
		ctx.save()
		_fadeOut?.setAlpha(ctx)
		ctx.translate(x, y)
		ctx.scale(T/8*1.05, T/8*1.05)
		Sprites[idx](ctx)
		ctx.restore()
	}
	drawTarget() {
		if (!State.isTitle && !State.isPlaying) return
		if (!Ticker.paused && _tgtDisp)
			Fruit.#drawSprite(Ctx, Fruit.number(), Fruit.targetPos)
	}
	drawLevelCounter() {
		const [x,y,w,h]= LevelCounterRect;
		Ctx.drawImage(BgCvs, x,y, w,h, x,y, w,h)
	}
	#drawLevelCounter() {
		const [x,y,w,h]= LevelCounterRect
		BgCtx.clearRect(x,y,w,h)
		for (let i=max(Game.level-7, 0),ofst=1; i<Game.level; i++) {
			const pos = Vec2(T*26-(T*2*ofst++), y).add(T)
			Fruit.#drawSprite(BgCtx, Fruit.number(i), pos)
		}
	}
}