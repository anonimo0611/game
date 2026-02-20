import {Game}   from './_main.js'
import {State}  from './state.js'
import {Score}  from './score.js'
import {GhsMgr} from './ghosts/_system.js'
import {Fruit}  from './fruit.js'
import * as Pts from './sprites/points.js'

const PtsMap = /**@type {Map<any,Points>}*/(new Map)
State.on({RoundEnds:()=> PtsMap.clear()})

/**
 @typedef {{
	key:{points:import('./sprites/points').PtsType},
	pos:Position, dur?:number, fn?:()=> void
}} PtsData
*/
export const PtsMgr = new class {
	/** @type {(data:PtsData, fn?:()=> void)=> void} */
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
		this.cache = Pts.cache(key.points)
		this.fade  = Fade.out(fadeDur/spd, (dur-fadeDur)/spd)
		Timer.set(dur/spd, ()=> {
			Timer.unfreeze()
			PtsMap.delete(key)
			fn?.()
		})
		State.isInGame && Score.add(key.points)
		PtsMap.set(key, this)
	}
	update() {
		this.fade.update()
	}
	draw() {
		const sideOfst = T*1.25
		const {pos:{x,y},cache:{ctx,w,h}}= this
		Fg.save()
		Fg.setAlpha(this.fade?.alpha)
		Fg.translate(clamp(x, sideOfst, BW-sideOfst), y)
		Fg.drawImage(ctx.canvas, -w/2,-h/2)
		Fg.restore()
	}
}