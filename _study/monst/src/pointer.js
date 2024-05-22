import {rgbaPct}  from '../lib/color.js';
import {cvs,ctx} from './canvas.js';
import {scale}   from './window.js';
import {Phase}	 from './phase.js';
import {Player}  from './player.js';

const ArrowGrad = ctx.createLinearGradient(-.5, 1, .5, 1);
ArrowGrad.addColorStop(0.0, rgbaPct(100,  10, 0, .75));
ArrowGrad.addColorStop(1.0, rgbaPct(100, 100, 0, .75));

let   firePower  = 0;
const PointerPos = vec2();

export const Pointer = freeze(new class {
	static {$ready(this.setup)}
	static setup() {
		$(cvs).on({pointerdown: Pointer.#onDown})
		$on({
			mousemove: Pointer.#onMove,
			touchmove: Pointer.#onMove,
			mouseup:   Pointer.#onUp,
			touchend:  Pointer.#onUp,
		});
	}
	get isTouchDevice() {
		return 'ontouchstart' in window;
	}
	#onDown(e) {
		switch (Phase.current) {
		case Phase.Enum.Idle:
			Pointer.#setPos(e);
			Phase.switchTo(Phase.Enum.Hold);
			break;
		case Phase.Enum.Over:
		case Phase.Enum.Clear:
			$trigger('Reset')
			break;
		}
	}
	#onUp(e) {
		if (!Phase.isHold) return;
		Phase.switchTo(Phase.Enum.Fire);
		const v = Vec2.sub(Player.current.pos, PointerPos)
			.normalized.mul(firePower).mul(0.1);
		Player.current.velocity.set(v);
	}
	#setPos(e) {
		const rect = cvs.getBoundingClientRect();
		e = e.touches?.[0] || e;
		PointerPos.x = (e.pageX - rect.left) / scale;
		PointerPos.y = (e.pageY - rect.top)  / scale;
	}
	#onMove(e) {
		e.preventDefault();
		Pointer.#setPos(e);
	}
	update() {
		firePower = Vec2.distance(Player.current.pos, PointerPos);
		firePower = min(firePower, 150);
	}
	draw() {
		if (!Phase.isHold) return;
		ctx.save();
			const player = Player.current;
			const playerToMouse = Vec2.sub(PointerPos, player.pos);
			ctx.fillStyle = ArrowGrad;
			ctx.translate(...player.pos.vals);
			ctx.rotate(-atan2(...playerToMouse.vals) + PI/2);
			ctx.scale(firePower*4, firePower);
			ctx.beginPath();
				ctx.moveTo(  -1,  0);
				ctx.lineTo(   0,  1);
				ctx.lineTo(-.25, .5);
				ctx.lineTo(   1,  0);
				ctx.lineTo(-.25,-.5);
				ctx.lineTo(   0, -1);
			ctx.closePath();
			ctx.fill();
		ctx.restore();
	}
});