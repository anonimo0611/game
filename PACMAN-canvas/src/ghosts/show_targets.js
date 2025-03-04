import {Timer}  from '../../_lib/timer.js'
import {Vec2}   from '../../_lib/vec2.js'
import {Dir}    from '../../_lib/direction.js'
import {State}  from '../_state.js'
import {Ctrl}   from '../control.js'
import {Maze}   from '../maze.js'
import {Player} from '../pacman/_pacman.js'
import {GhsMgr} from '../ghosts/_system.js'
import {Ghost}  from './_ghost.js'

export const Target = new class {
	/** @param {Ghost[]} ghosts */
	draw(ghosts=[]) {
		if (!Ctrl.showTargets || !State.isPlaying) return
		ghosts.forEach(Target.#strokeLines)
		ghosts.forEach(Target.#drawTargetMarker)
	}
	/** @param {Ghost} g */
	#enabled(g) {
		if (g.state.isIdle || g.frightened)    return false
		if (Timer.frozen && !g.state.isEscape) return false
		return true
	}
	/** @param {Ghost} g */
	#getTargetPos(g) {
		return (g.state.isGoOut || g.state.isEscape)
			? Vec2(Maze.PenEntrance).mul(T).add(T/2)
			: g.isScatter
				? Vec2(g.originalTarget).mul(T).add(T/2)
				: Vec2(g.chasePos)
	}
	/** @param {Ghost} g */
	#strokeLines(g) {
		if (!Target.#enabled(g)) return
		switch (g.idx) {
		case GhsType.Pinky: Target.#strokeAuxLines(g, 4); break
		case GhsType.Aosuke:Target.#strokeAuxLines(g, 2); break
		case GhsType.Guzuta:Target.#strokeGuzutaCircle(g);break
		}
	}
	/** @param {Ghost} g */
	#drawTargetMarker(g) {
		if (!Target.#enabled(g)) return
		const {x, y}= Target.#getTargetPos(g)
		Ctx.save()
		Ctx.globalAlpha = 0.8
		cvsFillCircle  (Ctx)(x, y, T*0.4, Color[g.name])
		cvsStrokeCircle(Ctx)(x, y, T*0.4,'#FFF', 4)
		Ctx.restore()
	}
	/**
	* @param {Ghost} g
	* @param {number} ofst
	*/
	#strokeAuxLines(g, ofst) {
		if (g.isScatter || !g.state.isWalk) return
		const {dir:pacDir,centerPos:pacPos}= Player
		const fwdVals = Player.forwardPos(ofst).vals
		Ctx.save()
		Ctx.globalAlpha = 0.8
		Ctx.lineWidth   = 6
		Ctx.lineJoin    ='round'
		Ctx.strokeStyle = Color[g.name]
		Ctx.beginPath()
		Ctx.moveTo(...pacPos.vals)
		Ctx.lineTo(...Vec2(pacDir).mul(ofst*T).add(pacPos).vals)
		pacDir == Dir.Up && Ctx.lineTo(...fwdVals)
		Ctx.stroke()
		if (g.idx == GhsType.Aosuke) {
			const akaVals = GhsMgr.akaCenter.vals
			cvsStrokeLine(Ctx)(...fwdVals, ...akaVals)
			cvsStrokeLine(Ctx)(...fwdVals, ...g.chasePos.vals)
			cvsFillCircle(Ctx)(...fwdVals, 8, Color[g.name])
			cvsFillCircle(Ctx)(...akaVals, 8, Color[g.name])
		}
		Ctx.restore()
	}
	/** @param {Ghost} g */
	#strokeGuzutaCircle(g) {
		if (g.isScatter || !g.state.isWalk) return
		Ctx.save()
		Ctx.globalAlpha = g.distanceToPacman < T*8 ? 0.4 : 0.8
		cvsStrokeCircle(Ctx)(...Player.centerPos.vals, T*8, Color[g.name], 6)
		Ctx.restore()
	}
}