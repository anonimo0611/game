import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Maze}   from '../maze.js'
import {Player} from '../player/player.js'
import {GhsMgr} from '../ghosts/_system.js'
import {Ghost}  from './ghost.js'
import {GuzutaThreshold} from './ghost_sub.js'

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
		Fg.save()
		Fg.setAlpha(0.8)
		Fg.fillCircle  (x,y, T*0.4, GhsColors[g.type])
		Fg.strokeCircle(x,y, T*0.4, 'white', 4)
		Fg.restore()
	}
	/**
	 @param {Ghost}  g
	 @param {number} ofst
	*/
	#auxLines(g, ofst) {
		const {center:{x,y},dir,inTunSide}= Player.core
		const fwdXY = Player.forwardPos(ofst).vals
		const ofsXY = Player.offsetTarget(ofst).vals
		Fg.save()
		Fg.setAlpha(0.8)
		Fg.lineWidth   = 6
		Fg.strokeStyle = GhsColors[g.type]
		if (g.type == GhsType.Pinky && !inTunSide
		 || g.type == GhsType.Aosuke) {
			dir != U
				? Fg.newLinePath([x,y], fwdXY)
				: Fg.newLinePath([x,y], fwdXY).lineTo(...ofsXY)
			Fg.stroke()
		}
		if (g.type == GhsType.Aosuke) {
			const tgtXY = g.chasePos.vals
			const akaXY = GhsMgr.akaCenterPos.vals
			Fg.newLinePath(akaXY, ofsXY, tgtXY).stroke()
			Fg.fillCircle(...ofsXY, 8, GhsColors[g.type])
		}
		Fg.restore()
	}
	/** @param {Ghost} g */
	#guzutaCircle(g) {
		const {center}= Player.core
		Fg.save()
		Fg.translate(...center.vals)
		Fg.setAlpha(g.chasePos.eq(center) ? 0.8 : 0.4)
		Fg.strokeCircle(0,0, T*GuzutaThreshold, GhsColors[g.type], 6)
		Fg.restore()
	}
}