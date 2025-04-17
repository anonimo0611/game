import {Game}   from './_main.js'
import {State}  from './state.js'
import {Score}  from './score.js'
import {GhsMgr} from './ghosts/_system.js'
import {Fruit}  from './fruit.js'
import Sprite   from './sprites/points.js'

/** @type {Map<any, Points>} */
const PtsMap = new Map()
$on({Title_Clear_Crashed:()=> PtsMap.clear()})

export const PtsMgr = new class {
	set(...args)   {new Points(...args)}
	update()       {PtsMap.forEach(v=> v.update())}
	drawFruitPts() {PtsMap.get(Fruit) ?.draw()}
	drawGhostPts() {PtsMap.get(GhsMgr)?.draw()}
}
class Points {
	/**
	 * @param {object}
	 * @param {function} fn
	 */
	constructor({key={},x=0,y=0,delay=1e3}={}, fn) {
		const speed   = Game.speedRate
		const fadeDur = 300
		this.score    = +key.score
		this.position = Vec2(x, y)
		this.fadeOut  = new FadeOut(fadeDur/speed, (delay-fadeDur)/speed)
		Timer.set(delay/speed, ()=> {
			Timer.unfreeze()
			PtsMap.delete(key)
			isFun(fn) && fn()
		})
		State.isPlaying && Score.add(this.score)
		PtsMap.set(key, this)
	}
	update() {
		this.fadeOut.update()
	}
	draw() {
		const {position:{x,y}}= this
		Ctx.save()
		this.fadeOut.setAlpha(Ctx)
		Ctx.translate(clamp(x, T, CvsW-T), y)
		Ctx.scale(T/8, T/8)
		Sprite.draw(0,0, this.score)
		Ctx.restore()
	}
}