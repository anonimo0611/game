import {Game}   from './_main.js'
import {State}  from './state.js'
import {Score}  from './score.js'
import {Ghosts} from './ghosts/_system.js'
import {Fruit}  from './fruit.js'
import {cache}  from './sprites/points.js'

const FADE_DUR = 300
const PopupMap = /**@type {Map<any,FloatingPts>}*/(new Map)
State.on({_RoundEnds:()=> PopupMap.clear()})

export const PtsMgr = new class PointsManager {
	/** @param {FloatingPtsData} data */
	set(data) {new FloatingPts(data)}
	update()       {PopupMap.forEach(v=> v.update())}
	drawFruitPts() {PopupMap.get(Fruit) ?.draw()}
	drawGhostPts() {PopupMap.get(Ghosts)?.draw()}
}
class FloatingPts {
	/** @param {FloatingPtsData} data */
	constructor({key,pos,dur=1e3,frozen=false,cb}) {
		const {speed:spd}= Game
		this.pos   = pos
		this.cache = cache(key, T*2)
		this.fade  = Fade.out(FADE_DUR/spd, (dur-FADE_DUR)/spd)

		PopupMap.set(key, this)
		Score.add(key.ptsValue)
		frozen && Timer.freeze()

		Timer.set(dur/spd, ()=> {
			PopupMap.delete(key)
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
		Fg.draw(ctx.canvas, {x,y}, this.fade.alpha)
	}
}