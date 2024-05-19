import {scale}    from './_canvas.js';
import {Game}     from './_main.js';
import {Grid}     from './_grid.js';
import {cvs}      from './_canvas.js';
import {Phase}    from './phase.js';
import {Orb,Orbs} from './orb.js';

export const Pointer = freeze(new class {
	static {$ready(this.setup)}
	static setup() {
		$(cvs).on({
			'mousedown touchstart': Pointer.#onDown,
			'mousemove touchmove':  Pointer.#onMove,
			'mouseup   touchend':   Pointer.#onUp,
		});
	}
	Pos = vec2(0, 0);
	#swappingPos = vec2(0, 0);
	get isTouchDevice() {
		return 'ontouchstart' in window;
	}
	get swappingPos() {
		return this.#swappingPos;
	}
	get swappingOrb() {
		const {y, x}= Pointer.swappingPos;
		return Orbs[y][x];
	}
	#setDownPos(e) {
		const rect = cvs.getBoundingClientRect();
		e = e.touches?.[0] || e;
		const pos = vec2(
			(e.pageX - rect.left) / scale,
			(e.pageY - rect.top)  / scale);
		Pointer.Pos.set(pos);
	}
	#setMovePos(e) {
		const rect = cvs.getBoundingClientRect();
		e = e.changedTouches?.[0] || e;
		const {Size:s} = Grid;
		const pos = vec2(
			clamp((e.pageX - rect.left)/scale, s/2, cvs.width  - s/2),
			clamp((e.pageY - rect.top) /scale, s/2, cvs.height - s/2)
		);
		Pointer.Pos.set(pos);
	}
	#onDown(e) {
		if (!Phase.isIdle) return;
		if (Pointer.isTouchDevice && e.type == 'mousedown') return;
		Pointer.#setDownPos(e);
		Pointer.#swappingPos = Vec2.divInt(Pointer.Pos, Grid.Size);
		Phase.switch(Phase.enum.Swap);
	}
	#onUp(e) {
		if (Phase.isSwap) {
			Game.resetComboCount();
			Orb.remove()
				? Phase.switch(Phase.enum.Remove)
				: Phase.switch(Phase.enum.Idle);
		}
	}
	get #inCornerOfTile() {
		const {x, y} = Vec2.remainder(Pointer.Pos, Grid.Size).div(Grid.Size);
		if (x <  .25 && y <  .25) return true;
		if (x >= .75 && y <  .25) return true;
		if (x <  .25 && y >= .75) return true;
		if (x >= .75 && y >= .75) return true;
		return false;
	}
	#onMove(e) {
		e.preventDefault();
		Pointer.#setMovePos(e);
		if (!Phase.isSwap) return;
		const swapDest = Vec2.divInt(Pointer.Pos, Grid.Size);
		const {x:nx,y:ny}= swapDest;
		const {x:sx,y:sy}= Pointer.swappingPos;

		if (Pointer.swappingOrb != Orbs[ny][nx] && !Pointer.#inCornerOfTile) {
			const srcCenter = vec2(Pointer.swappingPos).add(.5).mul(Grid.Size);
			const dstCenter = vec2(swapDest).add(.5).mul(Grid.Size);

			const center = Vec2.add(srcCenter,dstCenter).div(2);
			Orbs[sy][sx].rotCenter =
			Orbs[ny][nx].rotCenter = center;

			const centerToNew = Vec2.sub(dstCenter,center);
			Orbs[sy][sx].rotateMax = atan2(-centerToNew.y, centerToNew.x);
			Orbs[sy][sx].rotate    = Orbs[sy][sx].rotateMax - PI;
			Orbs[ny][nx].rotate    = Orbs[sy][sx].rotateMax;
			Orbs[ny][nx].rotateMax = Orbs[ny][nx].rotate + PI;

			Orb.swapType(Pointer.swappingOrb, Orbs[ny][nx]);
			Pointer.#swappingPos = swapDest;
		}
	}
});