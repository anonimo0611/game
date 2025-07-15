import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Maze}   from '../maze.js'
import {player} from '../player/player.js'
import {GhsMgr} from '../ghosts/_system.js'
import {Ghost}  from './ghost.js'

export default new class {
	/** @param {readonly Ghost[]} ghosts */
	draw(ghosts) {
		if (!Ctrl.showTargets || !State.isPlaying)
			return
		for (const g of ghosts) this.#strokeLines(g)
		for (const g of ghosts) this.#drawMarker(g)
	}
	/** @param {Ghost} g */
	#markerDisabled = g=> (
		   g.isFright
		|| g.state.isIdle
		|| g.state.isBitten
		|| (Timer.frozen && !g.isEscaping)
	)

	/** @param {Ghost} g */
	#getTargetPos = g=>
		(g.state.isGoOut || g.isEscaping)
			? Maze.House.EntranceTile.add(.5).mul(T)
			: g.isScatter
				? g.originalTargetTile.add(.5).mul(T)
				: g.chasePos

	/** @param {Ghost} g */
	#strokeLines(g) {
		if (Timer.frozen || !g.isChasing)
			return
		match(g.idx, {
			[GhsType.Pinky]:  ()=> this.#auxLines(g, 4),
			[GhsType.Aosuke]: ()=> this.#auxLines(g, 2),
			[GhsType.Guzuta]: ()=> this.#guzutaCircle(g),
		})
	}
	/** @param {Ghost} g */
	#drawMarker(g) {
		if (this.#markerDisabled(g))
			return
		const {x,y}= this.#getTargetPos(g)
		Ctx.save()
		Ctx.setAlpha(0.8)
		Ctx.fillCircle  (x,y, T*0.4, g.color)
		Ctx.strokeCircle(x,y, T*0.4, 'white', 4)
		Ctx.restore()
	}
	/** @param {Ghost} g */
	#auxLines(g, ofst=4) {
		const {center:pacPos,dir}= player
		const fwdXY = player.forwardPos (ofst).vals
		const ofsXY = player.forwardOfst(ofst).vals
		Ctx.save()
		Ctx.setAlpha(0.8)
		Ctx.lineWidth   = 6
		Ctx.strokeStyle = g.color
		if (!(g.idx == GhsType.Pinky && player.inTunnel)) {
			dir != U
				? Ctx.newLinePath(pacPos.vals, fwdXY)
				: Ctx.newLinePath(pacPos.vals, fwdXY).lineTo(...ofsXY)
			Ctx.stroke()
		}
		if (g.idx == GhsType.Aosuke) {
			const tgtXY = g.chasePos.vals
			const akaXY = GhsMgr.akaCenter.vals
			Ctx.newLinePath(akaXY, ofsXY, tgtXY).stroke()
			Ctx.fillCircle(...ofsXY, 8, g.color)
		}
		Ctx.restore()
	}
	/** @param {Ghost} g */
	#guzutaCircle(g) {
		Ctx.save()
		Ctx.setAlpha(g.sqrMagToPacman < (T*8) ** 2 ? 0.4 : 0.8)
		Ctx.strokeCircle(...player.center.vals, T*8, g.color, 6)
		Ctx.restore()
	}
}