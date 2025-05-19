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
	/**
	 * @param {PtsData}  data
	 * @param {Function} [fn]
	 */
	set(data,fn) {new Points(data,fn)}
	update()     {PtsMap.forEach(v=> v.update())}
	drawBehind() {PtsMap.get(Fruit) ?.draw()}
	drawFront()  {PtsMap.get(GhsMgr)?.draw()}
}
class Points {
	/**
 	 * @typedef {{key:{score:number},x:number,y:number,duration?:number}} PtsData
	 * @param {PtsData}  PtsData
	 * @param {Function} [fn]
	 */
	constructor({key,x,y,duration=1e3}, fn) {
		const speed   = Game.speedRate
		const fadeDur = 300
		this.score    = key.score
		this.position = Vec2(x, y)
		this.fadeOut  = new FadeOut(fadeDur/speed, (duration-fadeDur)/speed)
		Timer.set(duration/speed, ()=> {
			Timer.unfreeze()
			PtsMap.delete(key)
			fn?.()
		})
		State.isPlaying && Score.add(this.score)
		PtsMap.set(key, this)
	}
	update() {
		this.fadeOut.update()
	}
	draw() {
		const {position:{x,y}}= this
		Ctx.save(),this.fadeOut.setAlpha(Ctx)
		Ctx.translate(clamp(x, T, CvsW-T), y)
		Sprite.draw(0,0, this.score)
		Ctx.restore()
	}
}
