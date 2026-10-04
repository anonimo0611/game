import {Game}  from './_main.js'
import {State} from './state.js'
import {Score} from './score.js'
import {cache} from './sprites/points.js'

const FADE_TIME = 300
const PointsMap = /**@type {Map<PointType,FloatingPts>}*/(new Map)
State.on({_RoundEnds:()=> PointsMap.clear()})

export const PtsMgr = new class PointsManager {
	/** @param {FloatingPtsData} data */
	set(data) {new FloatingPts(data)}
	update()       {PointsMap.forEach(v=> v.update())}
	drawFruitPts() {PointsMap.get(PointType.Fruit)?.draw()}
	drawGhostPts() {PointsMap.get(PointType.Ghost)?.draw()}
}
class FloatingPts {
	pos; cache; fade;
	constructor(/**@type {FloatingPtsData}*/
		{pts,x,y,dur=1e3,frozen=false,cb}
	) {
		const {speed:spd}= Game
		this.pos   = {x,y}
		this.cache = cache(pts, T*2)
		this.fade  = Fade.out(FADE_TIME/spd, (dur-FADE_TIME)/spd)

		PointsMap.set(pts.type, this)
		Score.add(pts.value)
		frozen && Timer.freeze()

		Timer.set(dur/spd, ()=> {
			PointsMap.delete(pts.type)
			frozen && Timer.unfreeze()
			cb?.()
		}, {ignoreFrozen:true})
	}
	update() {
		this.fade.update()
	}
	draw() {
		const sideOfst = T*1.25
		const {pos:{x:sx,y},cache:{ctx}}= this
		const x = clamp(sx, sideOfst, BW-sideOfst)
		Fg.put(ctx.canvas, {x,y}, this.fade.alpha)
	}
}