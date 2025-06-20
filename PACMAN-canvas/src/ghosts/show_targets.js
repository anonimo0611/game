import {State}  from '../state.js'
import {Ctrl}   from '../control.js'
import {Maze}   from '../maze.js'
import {Player} from '../pacman.js'
import {GhsMgr} from '../ghosts/_system.js'
import {Ghost}  from './ghost.js'

export default new class {
	/** @param {readonly Ghost[]} ghosts */
	draw(ghosts) {
		if (!Ctrl.showTargets || !State.isPlaying) return
		for (const g of ghosts) this.#strokeLines(g)
		for (const g of ghosts) this.#drawTargetMarker(g)
	}
	/** @param {Ghost} g */
	#disabled(g) {
		return g.isIdle
			|| g.isFright
			|| g.isBitten
			||(g.frozen && !g.isEscaping)
	}
	/** @param {Ghost} g */
	#getTargetPos(g) {
		return (g.isGoOut || g.isEscaping)
			? Maze.House.EntranceTile.add(.5).mul(T)
			: g.isScatter
				? g.originalTargetTile.add(.5).mul(T)
				: g.chasePos
	}
	/** @param {Ghost} g */
	#strokeLines(g) {
		if (!g.isChase || this.#disabled(g)) return
		switch (g.idx) {
		case GhsType.Pinky: this.#auxLines(g, 4); break
		case GhsType.Aosuke:this.#auxLines(g, 2); break
		case GhsType.Guzuta:this.#guzutaCircle(g);break
		}
	}
	/** @param {Ghost} g */
	#drawTargetMarker(g) {
		if (this.#disabled(g)) return
		const {x,y}= this.#getTargetPos(g)
		Ctx.save()
		Ctx.globalAlpha = 0.8
		Ctx.fillCircle  (x,y, T*0.4, g.color)
		Ctx.strokeCircle(x,y, T*0.4,'#FFF', 4)
		Ctx.restore()
	}
	/** @param {Ghost} g */
	#auxLines(g, ofst=4) {
		const {dir:pacDir,centerPos:pacPos}= Player.instance
		const fwdXY = Player.instance.forwardPos(ofst).vals
		Ctx.save()
		Ctx.globalAlpha = 0.8
		Ctx.lineWidth   = 6
		Ctx.lineJoin    ='round'
		Ctx.strokeStyle = g.color
		Ctx.beginPath()
		Ctx.moveTo(...pacPos.vals)
		Ctx.lineTo(...Vec2[pacDir].mul(ofst*T).add(pacPos).vals)
		pacDir == U && Ctx.lineTo(...fwdXY)
		Ctx.stroke()
		if (g.idx == GhsType.Aosuke) {
			const akaXY = GhsMgr.akaCenter.vals
			Ctx.newLinePath(akaXY, fwdXY, g.chasePos.vals).stroke()
			Ctx.fillCircle(...fwdXY, 8, g.color)
			Ctx.fillCircle(...akaXY, 8, g.color)
		}
		Ctx.restore()
	}
	/** @param {Ghost} g */
	#guzutaCircle(g) {
		const radius = T*8, {centerPos:pacPos}= Player.instance
		Ctx.save()
		Ctx.globalAlpha = g.sqrMagToPacman < radius*radius ? 0.4 : 0.8
		Ctx.strokeCircle(...pacPos.vals, radius, g.color, 6)
		Ctx.restore()
	}
}