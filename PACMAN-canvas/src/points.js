import {Game}   from './_main.js'
import {State}  from './state.js'
import {Score}  from './score.js'
import {GhsMgr} from './ghosts/_system.js'
import {Fruit}  from './fruit.js'
import * as Pts from './sprites/points.js'

const PtsMap = /**@type Map<any, Points>*/(new Map)
$on({Title_Clear_Crashed:()=> PtsMap.clear()})

export const PtsMgr = new class {
	get Points() {return Points}
	update()     {PtsMap.forEach(v=> v.update())}
	drawBehind() {PtsMap.get(Fruit) ?.draw()}
	drawFront()  {PtsMap.get(GhsMgr)?.draw()}
}
class Points {
	/**
	 * @typedef {import('sprites/points.js').PtsType} PtsType
	 * @param {{key:{score:PtsType}, x:number, y:number, duration?:number}} data
	 * @param {Function} [fn]
	 */
	constructor({key,x,y,duration:dur=1e3}, fn) {
		const spd  = Game.speedRate, fadeDur = 300
		this.cache = Pts.cache(key.score)
		this.pos   = Vec2(x, y)
		this.score = key.score
		this.fade  = new FadeOut(fadeDur/spd, (dur-fadeDur)/spd)
		Timer.set(dur/spd, ()=> {
			Timer.unfreeze()
			PtsMap.delete(key)
			fn?.()
		})
		State.isPlaying && Score.add(key.score)
		PtsMap.set(key, this)
	}
	update() {
		this.fade.update()
	}
	draw() {
		const sideOfst = T*1.25
		const {pos:{x,y},cache:{ctx,w,h}}= this
		Ctx.save()
		Ctx.setAlpha(this.fade?.alpha)
		Ctx.translate(clamp(x, sideOfst, CvsW-sideOfst), y)
		Ctx.drawImage(ctx.canvas, -w/2,-h/2)
		Ctx.restore()
	}
}