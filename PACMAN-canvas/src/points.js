import {Game}   from './_main.js'
import {State}  from './state.js'
import {Score}  from './score.js'
import {GhsMgr} from './ghosts/_system.js'
import {Fruit}  from './fruit.js'
import {cache}  from './sprites/points.js'

const popups = /**@type {Map<any,FloatingPts>}*/(new Map)
State.on({_RoundEnds:()=> popups.clear()})

export const PtsMgr = new class {
	/** @param {FloatingPtsData} data */
	set(data) {new FloatingPts(data)}
	update()      {popups.forEach(v=> v.update())}
	drawFruitPts(){popups.get(Fruit) ?.draw()}
	drawGhostPts(){popups.get(GhsMgr)?.draw()}
}
class FloatingPts {
	/** @param {FloatingPtsData} data */
	constructor({key,pos,dur=1e3,fn}) {
		const spd  = Game.speed, fadeDur = 300
		this.pos   = pos
		this.cache = cache((key == Fruit ? 0:1), key.points)
		this.fade  = Fade.out(fadeDur/spd, (dur-fadeDur)/spd)
		Timer.set(dur/spd, ()=> {
			Timer.unfreeze()
			popups.delete(key)
			fn?.()
		})
		popups.set(key, this)
		State.isInGame && Score.add(key.points)
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