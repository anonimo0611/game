import {Sound}  from '../_snd/sound.js'
import {Game}   from './_main.js'
import {State}  from './_state.js'
import {DotMax} from './_map_data.js'
import {Maze}   from './maze.js'
import {PtsMgr} from './points.js'
import {Player} from './pacman/_pacman.js'
import * as Spr from './fruits_sprite.js'

// The fruit appear after 70 or 170 dots are cleared
const AppearSet  = new Set([70,170])
const LevelTable = freeze([0,1,2,2,3,3,4,4,5,5,6,6,7])
const PointTable = freeze([100,300,500,700,1e3,2e3,3e3,5e3])
const TargetPos  = Vec2(CvsW/2, T*18.5).freeze()

const LvCounterMax  = 7
const LvCounterRect = freeze([T*12, CvsH-T*2, T*2*LvCounterMax, T*2])

/** @type {?FadeOut} */
let _fadeOut = null
let _tgtDisp = true

export const Fruit = new class {
	static {$ready(this.setup)}
	static setup() {
		$on('Title Ready',  Fruit.#reset)
		$on('LevelChanged', Fruit.#setImage)
		Player.bindDotEaten(Fruit.#dotEaten)
	}
	get score() {
		return PointTable[Fruit.number()]
	}
	number(i=Game.level-1) {
		return LevelTable.at(i >= LevelTable.length ? -1 : i)
	}
	#reset() {
		_fadeOut = null
		_tgtDisp = State.isTitle
	}
	#dotEaten() {
		if (!AppearSet.has(DotMax - Maze.dotsLeft))
			return
		_tgtDisp = true
		// The fruit disappearing is between 9 and 10 seconds
		const {speedRate:rate}=Game, fadeDur=300
		const setFadeOut = ()=> _fadeOut = new FadeOut(fadeDur/rate)
		Timer.set(randInt(9e3, 1e4-fadeDur)/rate, setFadeOut, {key:Fruit})
	}
	#collideWith(pos=Player.centerPos) {
		if (!_tgtDisp || !collisionCircle(pos, TargetPos, T/2))
			return
		_tgtDisp = false
		Timer.cancel(Fruit) && Sound.play('fruit')
		PtsMgr.set({key:Fruit, delay:2e3, ...TargetPos})
	}
	update() {
		_fadeOut?.update()
		if (_fadeOut?.working === false)
		   [_fadeOut,_tgtDisp] = [null,false]
		Fruit.#collideWith()
	}
	drawTarget() {
		if (!State.isTitle && !State.isPlaying)
			return
		if (!Ticker.paused && _tgtDisp) {
			Ctx.save()
			_fadeOut?.setAlpha(Ctx)
			Ctx.translate(...TargetPos.vals)
			Ctx.drawImage(Spr.cachedCvs, -T,-T)
			Ctx.restore()
		}
	}
	drawLevelCounter() {
		const [x,y,w,h] = LvCounterRect
		Ctx.drawImage(Bg.cvs, x,y, w,h, x,y, w,h)
	}
	#setImage() {
		const [x,y,w,h] = LvCounterRect
		const initCount = max(Game.level-LvCounterMax, 0)
		Spr.cache(Fruit.number())
		Bg.ctx.clearRect(x,y,w,h)
		for (let i=initCount,cols=1; i<Game.level; i++) {
			const xy = Vec2(x+w+T-(T*2*cols++), y+T).vals
			Spr.draw(Bg.ctx, Fruit.number(i),...xy)
		}
	}
}