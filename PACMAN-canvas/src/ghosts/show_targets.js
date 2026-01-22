import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Maze}   from '../maze.js'
import {player} from '../player/player.js'
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
			? Maze.House.EntranceTile.add(.5).mul(T)
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
		Ctx.save()
		Ctx.setAlpha(0.8)
		Ctx.fillCircle  (x,y, T*0.4, GhsColors[g.type])
		Ctx.strokeCircle(x,y, T*0.4, 'white', 4)
		Ctx.restore()
	}
	/**
	 @param {Ghost}  g
	 @param {number} ofst
	*/
	#auxLines(g, ofst) {
		const {center:{x,y},dir}= player
		const fwdXY = player.forwardPos(ofst).vals
		const ofsXY = player.offsetTarget(ofst).vals
		Ctx.save()
		Ctx.setAlpha(0.8)
		Ctx.lineWidth   = 6
		Ctx.strokeStyle = GhsColors[g.type]
		if (g.type == GhsType.Pinky && !player.inTunSide
		 || g.type == GhsType.Aosuke) {
			dir != U
				? Ctx.newLinePath([x,y], fwdXY)
				: Ctx.newLinePath([x,y], fwdXY).lineTo(...ofsXY)
			Ctx.stroke()
		}
		if (g.type == GhsType.Aosuke) {
			const tgtXY = g.chasePos.vals
			const akaXY = GhsMgr.akaCenterPos.vals
			Ctx.newLinePath(akaXY, ofsXY, tgtXY).stroke()
			Ctx.fillCircle(...ofsXY, 8, GhsColors[g.type])
		}
		Ctx.restore()
	}
	/** @param {Ghost} g */
	#guzutaCircle(g) {
		Ctx.save()
		Ctx.translate(...player.center.vals)
		Ctx.setAlpha(g.chasePos.eq(player.center) ? 0.8 : 0.4)
		Ctx.strokeCircle(0,0, T*GuzutaThreshold, GhsColors[g.type], 6)
		Ctx.restore()
	}
}