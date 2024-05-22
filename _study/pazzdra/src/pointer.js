import {scale}    from './_canvas.js';
import {Game}     from './_main.js';
import {Grid}     from './_grid.js';
import {cvs}      from './_canvas.js';
import {Phase}    from './phase.js';
import {Orb,Orbs} from './orb.js';

export const Pointer = freeze(new class {
	static {$ready(this.setup)}
	static setup() {
		$(cvs).on({pointerdown:Pointer.#onDown});
		$on({
			mousemove: Pointer.#onMove,
			mouchmove: Pointer.#onMove,
			pointerup: Pointer.#onUp,
		});
	}
	Pos = vec2(0, 0);
	#swappingPos = vec2(0, 0);
	get isTouchDevice() {
		return 'ontouchstart' in window;
	}
	get swappingPos() {
		return Pointer.#swappingPos;
	}
	get swappingOrb() {
		const {y, x}= Pointer.swappingPos;
		return Orbs[y][x];
	}
	get #inCornerOfTile() {
		const {x, y}= Vec2.remainder(Pointer.Pos, Grid.Size).div(Grid.Size);
		if (x <  .25 && y <  .25) return true;
		if (x >= .75 && y <  .25) return true;
		if (x <  .25 && y >= .75) return true;
		if (x >= .75 && y >= .75) return true;
		return false;
	}
	#setPos(e) {
		e = e.touches?.[0] || e;
		const {Size:s} = Grid;
		const rect = cvs.getBoundingClientRect();
		const pos = vec2(
			clamp((e.pageX - rect.left)/scale, s/2, cvs.width  - s/2),
			clamp((e.pageY - rect.top) /scale, s/2, cvs.height - s/2)
		);
		Pointer.Pos.set(pos);
	}
	#onDown(e) {
		if (!Phase.isIdle) return;
		Pointer.#setPos(e);
		Pointer.#swappingPos = Vec2.divInt(Pointer.Pos, Grid.Size);
		Phase.switchToSwap();
	}
	#onMove(e) {
		e.preventDefault();
		Pointer.#setPos(e);
		if (!Phase.isSwap) return;
		const swapDest = Vec2.divInt(Pointer.Pos, Grid.Size);
		const {x:dx,y:dy}= swapDest;
		const {x:sx,y:sy}= Pointer.swappingPos;

		if (Pointer.swappingOrb != Orbs[dy][dx] && !Pointer.#inCornerOfTile) {
			const srcCenter = vec2(Pointer.swappingPos).add(.5).mul(Grid.Size);
			const dstCenter = vec2(swapDest).add(.5).mul(Grid.Size);

			const center = Vec2.add(srcCenter,dstCenter).div(2);
			Orbs[sy][sx].rotCenter =
			Orbs[dy][dx].rotCenter = center;

			const centerToDst = Vec2.sub(dstCenter,center);
			Orbs[sy][sx].rotateMax = atan2(-centerToDst.y, centerToDst.x);
			Orbs[sy][sx].rotate    = Orbs[sy][sx].rotateMax - PI;
			Orbs[dy][dx].rotate    = Orbs[sy][sx].rotateMax;
			Orbs[dy][dx].rotateMax = Orbs[dy][dx].rotate + PI;

			Orb.swapType(Pointer.swappingOrb, Orbs[dy][dx]);
			Pointer.#swappingPos = swapDest;
		}
	}
	#onUp(e) {
		if (!Phase.isSwap) return;
		Game.resetComboCount();
		Orb.remove()
			? Phase.switchToRemove()
			: Phase.switchToIdle();
	}
});