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
	get inCornerOfTile() {
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
		if (!Phase.isSwap) return;
		e.preventDefault();
		Pointer.#setPos(e);

		const swapSrc = Pointer.swappingPos;
		const swapDst = Vec2.divInt(Pointer.Pos, Grid.Size);
		const SrcOrb  = Orbs[swapSrc.y][swapSrc.x];
		const DstOrb  = Orbs[swapDst.y][swapDst.x];

		if (Pointer.swappingOrb != DstOrb && !Pointer.inCornerOfTile) {
			const srcCenter = vec2(swapSrc).add(.5).mul(Grid.Size);
			const dstCenter = vec2(swapDst).add(.5).mul(Grid.Size);

			const center = Vec2.add(srcCenter, dstCenter).div(2);
			SrcOrb.rotCenter =
			DstOrb.rotCenter = center;

			const centerToDst = Vec2.sub(dstCenter, center);
			SrcOrb.rotateMax = atan2(-centerToDst.y, centerToDst.x);
			SrcOrb.rotate    = SrcOrb.rotateMax - PI;
			DstOrb.rotate    = SrcOrb.rotateMax;
			DstOrb.rotateMax = DstOrb.rotate + PI;

			Orb.swapType(SrcOrb, DstOrb);
			Pointer.#swappingPos = swapDst;
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