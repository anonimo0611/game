import {Game}     from './_main.js'
import {State}    from './state.js'
import {ScoreMgr} from './score.js'
import {FruitMgr} from './fruit.js'
import {GhostMgr} from './ghosts/_system.js'
import {cache}    from './sprites/points.js'

const FADE_DUR = 300
const PopupMap = /**@type {Map<any,FloatingPts>}*/(new Map)
State.on({_RoundEnds:()=> PopupMap.clear()})

export const PtsMgr = new class PointsManager {
	/** @param {FloatingPtsData} data */
	set(data) {new FloatingPts(data)}
	update()       {PopupMap.forEach(v=> v.update())}
	drawFruitPts() {PopupMap.get(FruitMgr)?.draw()}
	drawGhostPts() {PopupMap.get(GhostMgr)?.draw()}
}
class FloatingPts {
	/** @param {FloatingPtsData} data */
	constructor({key,pos,dur=1e3,cb}) {
		const {speed:spd}= Game
		this.pos   = pos
		this.cache = cache(key, T*2)
		this.fade  = Fade.out(FADE_DUR/spd, (dur-FADE_DUR)/spd)
		PopupMap.set(key,this)
		State.isInGame && ScoreMgr.add(key.pointValue)
		Timer.set(dur/spd, ()=> {
			Timer.unfreeze()
			PopupMap.delete(key)
			cb?.()
		}, {ignoreFrozen:true})
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