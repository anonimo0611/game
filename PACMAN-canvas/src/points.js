import {Game}     from './_main.js'
import {State}    from './state.js'
import {ScoreMgr} from './score.js'
import {FruitMgr} from './fruit.js'
import {GhostMgr} from './ghosts/_system.js'
import {cache}    from './sprites/points.js'

const FadeDur = 300
const Popups  = /**@type {Map<any,FloatingPts>}*/(new Map)
State.on({_RoundEnds:()=> Popups.clear()})

export const PtsMgr = new class PointsManager {
	/** @param {FloatingPtsData} data */
	set(data) {new FloatingPts(data)}
	update()       {Popups.forEach(v=> v.update())}
	drawFruitPts() {Popups.get(FruitMgr)?.draw()}
	drawGhostPts() {Popups.get(GhostMgr)?.draw()}
}
class FloatingPts {
	/** @param {FloatingPtsData} data */
	constructor({key,pos,dur=1e3,cb}) {
		const {speed:spd}= Game
		this.pos   = pos
		this.cache = cache((key == FruitMgr ? 0:1), key.points)
		this.fade  = Fade.out(FadeDur/spd, (dur-FadeDur)/spd)

		Popups.set(key, this)
		State.isInGame && ScoreMgr.add(key.points)

		Timer.set(dur/spd, ()=> {
			Timer.unfreeze()
			Popups.delete(key)
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