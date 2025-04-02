import {State}  from '../_state.js'
import {Ctrl}   from '../control.js'
import {Maze}   from '../maze.js'
import {Player} from '../pacman/_pacman.js'
import {GhsMgr} from '../ghosts/_system.js'
import {Ghost}  from './_ghost.js'

export default new class {
	/** @param {Ghost[]} ghosts */
	draw(ghosts=[]) {
		if (!Ctrl.showTargets || !State.isPlaying) return
		for (let g of ghosts) this.#strokeLines(g)
		for (let g of ghosts) this.#drawTargetMarker(g)
	}

	/** @param {Ghost} g */
	#disabled(g) {
		return g.state.isIdle
			|| g.frightened
			|| (Timer.frozen && !g.state.isEscape)
	}

	/** @param {Ghost} g */
	#getTargetPos(g) {
		return (g.state.isGoOut || g.state.isEscape)
			? Maze.House.Entrance.add(.5).mul(T)
			: g.isScatter
				? g.originalTarget.add(.5).mul(T)
				: g.chasePos
	}

	/** @param {Ghost} g */
	#strokeLines(g) {
		if (this.#disabled(g)) return
		switch (g.idx) {
		case GhsType.Pinky: this.#strokeAuxLines(g, 4); break
		case GhsType.Aosuke:this.#strokeAuxLines(g, 2); break
		case GhsType.Guzuta:this.#strokeGuzutaCircle(g);break
		}
	}

	/** @param {Ghost} g */
	#drawTargetMarker(g) {
		if (this.#disabled(g)) return
		const {x,y}= this.#getTargetPos(g)
		Ctx.save()
		Ctx.globalAlpha = 0.8
		Ctx.fillCircle  (x,y, T*0.4, Color[g.name])
		Ctx.strokeCircle(x,y, T*0.4,'#FFF', 4)
		Ctx.restore()
	}

	/**
	 * @param {Ghost} g
	 * @param {number} ofst
	 */
	#strokeAuxLines(g, ofst) {
		if (g.isScatter || !g.state.isWalk) return
		const {dir:pacDir,centerPos:pacPos}= Player
		const fwdXY = Player.forwardPos(ofst).vals
		Ctx.save()
		Ctx.globalAlpha = 0.8
		Ctx.lineWidth   = 6
		Ctx.lineJoin    ='round'
		Ctx.strokeStyle = Color[g.name]
		Ctx.beginPath()
		Ctx.moveTo(...pacPos.vals)
		Ctx.lineTo(...Vec2(pacDir).mul(ofst*T).add(pacPos).vals)
			pacDir == U && Ctx.lineTo(...fwdXY)
		Ctx.stroke()
		if (g.idx == GhsType.Aosuke) {
			const akaXY = GhsMgr.akaCenter.vals
			Ctx.strokeLine(...fwdXY, ...akaXY)
			Ctx.strokeLine(...fwdXY, ...g.chasePos.vals)
			Ctx.fillCircle(...fwdXY, 8, Color[g.name])
			Ctx.fillCircle(...akaXY, 8, Color[g.name])
		}
		Ctx.restore()
	}

	/** @param {Ghost} g */
	#strokeGuzutaCircle(g) {
		if (g.isScatter || !g.state.isWalk) return
		Ctx.save()
		Ctx.globalAlpha = g.distanceToPacman < T*8 ? 0.4 : 0.8
		Ctx.strokeCircle(...Player.centerPos.vals, T*8, Color[g.name], 6)
		Ctx.restore()
	}
}