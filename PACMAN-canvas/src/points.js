import {Game}   from './_main.js'
import {State}  from './state.js'
import {Score}  from './score.js'
import {GhsMgr} from './ghosts/_system.js'
import {Fruit}  from './fruit.js'
import * as Pts from './sprites/points.js'

const PtsMap = /**@type {Map<any, Points>}*/(new Map)
State.on({_Clear_Crashed:()=> PtsMap.clear()})

/**
@typedef {typeof Pts.Score.All[number]} Pts
@typedef {{key:{score:Pts}, pos:Position, dur?:number, fn?:function}} PtsData
*/
export const PtsMgr = new class {
	/** @type {(data:PtsData, fn?:function)=> void} */
	set(data,fn)   {new Points({...data,fn})}
	update()       {PtsMap.forEach(v=> v.update())}
	drawFruitPts() {PtsMap.get(Fruit) ?.draw()}
	drawGhostPts() {PtsMap.get(GhsMgr)?.draw()}
}
class Points {
	/** @param {PtsData} data */
	constructor({key,pos,dur=1e3,fn}) {
		const spd  = Game.speed, fadeDur = 300
		this.pos   = pos
		this.cache = Pts.cache(key.score)
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
		Ctx.translate(clamp(x, sideOfst, BW-sideOfst), y)
		Ctx.drawImage(ctx.canvas, -w/2,-h/2)
		Ctx.restore()
	}
}