import {Game}   from './_main.js'
import {State}  from './state.js'
import {Score}  from './score.js'
import {cache}  from './sprites/points.js'

const FADE_DUR = 300
const PopupMap = /**@type {Map<PtsIdx,FloatingPts>}*/(new Map)
State.on({_RoundEnds:()=> PopupMap.clear()})

export const PtsMgr = new class PointsManager {
	/** @param {FloatingPtsData} data */
	set(data) {new FloatingPts(data)}
	update()       {PopupMap.forEach(v=> v.update())}
	drawFruitPts() {PopupMap.get(PointType.Fruit)?.draw()}
	drawGhostPts() {PopupMap.get(PointType.Ghost)?.draw()}
}
class FloatingPts {
	pos; cache; fade;
	constructor(/**@type {FloatingPtsData}*/
		{key,x,y,dur=1e3,frozen=false,cb}
	) {
		const {speed:spd}= Game
		this.pos   = {x,y}
		this.cache = cache(key, T*2)
		this.fade  = Fade.out(FADE_DUR/spd, (dur-FADE_DUR)/spd)

		PopupMap.set(key.ptsType, this)
		Score.add(key.ptsValue)
		frozen && Timer.freeze()

		Timer.set(dur/spd, ()=> {
			PopupMap.delete(key.ptsType)
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
		const x = mathClamp(sx, sideOfst, BW-sideOfst)
		Fg.put(ctx.canvas, {x,y}, this.fade.alpha)
	}
}