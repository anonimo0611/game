import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Maze}   from '../maze.js'
import {Player} from '../player/player.js'
import {GhsMgr} from '../ghosts/_system.js'
import {Ghost}  from './ghost.js'
import {GuzutaThreshold} from './ghost_sub.js'

const ctx = Fg

export default new class {
	/** @param {readonly Ghost[]} ghosts */
	draw(ghosts) {
		if (!Ctrl.showTargets || !State.isInGame)
			return
		for (const g of ghosts) this.#strokeLines(g)
		for (const g of ghosts) this.#drawMarker(g)
	}
	/** @param {Ghost} g */
	#markerDisabled = g=> (
		   g.isFrightened
		|| g.state.isIdle
		|| g.state.isBitten
		|| (Timer.frozen && !g.isEscaping)
	)

	/** @param {Ghost} g */
	#getTargetPos = g=>
		(g.state.isGoingOut || g.isEscaping)
			? Maze.House.EntryTile.add(.5).mul(T)
			: g.isScattering
				? g.originalTargetTile.add(.5).mul(T)
				: g.chasePos

	/** @param {Ghost} g */
	#strokeLines(g) {
		if (Timer.frozen
		 || g.type == GhsType.Akabei
		 || g.isChasing == false)
			return
		g.type == GhsType.Guzuta
			? this.#guzutaCircle(g)
			: this.#auxLines(g, g.chaseOffset)
	}
	/** @param {Ghost} g */
	#drawMarker(g) {
		if (this.#markerDisabled(g))
			return
		const {x,y}= this.#getTargetPos(g)
		ctx.save()
		ctx.setAlpha(0.8)
		ctx.fillCircle  (x,y, T*0.4, GhsColors[g.type])
		ctx.strokeCircle(x,y, T*0.4, 'white', 4)
		ctx.restore()
	}
	/**
	 @param {Ghost}  g
	 @param {number} ofst
	*/
	#auxLines(g, ofst) {
		const {center:{x,y},dir,inTunSide}= Player.core
		const fwdXY = Player.forwardPos(ofst).vals
		const ofsXY = Player.offsetTarget(ofst).vals
		ctx.save()
		ctx.setAlpha(0.8)
		ctx.lineWidth   = 6
		ctx.strokeStyle = GhsColors[g.type]
		if (g.type == GhsType.Pinky && !inTunSide
		 || g.type == GhsType.Aosuke) {
			dir != U
				? ctx.newLinePath([x,y], fwdXY)
				: ctx.newLinePath([x,y], fwdXY).lineTo(...ofsXY)
			ctx.stroke()
		}
		if (g.type == GhsType.Aosuke) {
			const tgtXY = g.chasePos.vals
			const akaXY = GhsMgr.akaCenterPos.vals
			ctx.newLinePath(akaXY, ofsXY, tgtXY).stroke()
			ctx.fillCircle(...ofsXY, 8, GhsColors[g.type])
		}
		ctx.restore()
	}
	/** @param {Ghost} g */
	#guzutaCircle(g) {
		const {center}= Player.core
		ctx.save()
		ctx.translate(...center.vals)
		ctx.setAlpha(g.chasePos.eq(center) ? 0.8 : 0.4)
		ctx.strokeCircle(0,0, T*GuzutaThreshold, GhsColors[g.type], 6)
		ctx.restore()
	}
}