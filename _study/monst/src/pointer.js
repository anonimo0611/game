import {Game}	 from './_main.js';
import {cvs,ctx} from './canvas.js';
import {scale}   from './window.js';
import {Phase}	 from './phase.js';
import {Player}  from './player.js';

const
	ArrowGrad = ctx.createLinearGradient(-.5, 1, .5, 1);
	ArrowGrad.addColorStop(0.0, 'rgba(100%  10% 0% /.7)');
	ArrowGrad.addColorStop(1.0, 'rgba(100% 100% 0% /.7)');

export const Pointer = freeze(new class {
	static {
		$on('load',this.setup);
	}
	static setup() {
		$(cvs).on('pointerdown',   Pointer.#onDown)
		$on('mouseup touchend',    Pointer.#onUp)
		$on('mousemove touchmove', Pointer.#onMove)
	}
	get isTouchDevice() {
		return 'ontouchstart' in window;
	}
	#Power = 0;
	get Power() {
		return this.#Power;
	}
	Pos = vec2(0, 0);
	#onDown(e) {
		switch (Phase.current) {
		case Phase.enum.Idle:
			Pointer.#setPos(e);
			Phase.switch(Phase.enum.Hold);
			break;
		case Phase.enum.Over:
		case Phase.enum.Clear:
			$trigger('Reset')
			break;
		}
	}
	#onUp(e) {
		const player = Player.current;
		switch (Phase.current) {
		case Phase.enum.Hold:
			Phase.switch(Phase.enum.Fire);
			const v = Vec2.sub(player.position, Pointer.Pos).normalized.mul(Pointer.Power);
			player.velocity.set(v.mul(0.1));
			break;
		}
	}
	#setPos(e) {
		const rect = cvs.getBoundingClientRect();
		e = e.touches?.[0] || e;
		Pointer.Pos.x = (e.pageX - rect.left) / scale;
		Pointer.Pos.y = (e.pageY - rect.top)  / scale;
	}
	#onMove(e) {
		e.preventDefault();
		Pointer.#setPos(e);
	}
	update() {
		Pointer.#Power = Vec2.distance(Player.current.position, Pointer.Pos);
		Pointer.#Power = min(Pointer.Power, 142);
	}
	draw() {
		if (!Phase.isHold)
			return;
		ctx.save();
			const player = Player.current;
			const playerToMouse = Vec2.sub(Pointer.Pos, player.position);
			ctx.translate(...player.position.vals);
			ctx.rotate(-atan2(...playerToMouse.vals) + PI/2);
			ctx.scale(Pointer.Power*4, Pointer.Power);
			ctx.beginPath();
				ctx.moveTo(  -1,  0);
				ctx.lineTo(   0,  1);
				ctx.lineTo(-.25, .5);
				ctx.lineTo(   1,  0);
				ctx.lineTo(-.25,-.5);
				ctx.lineTo(   0, -1);
			ctx.closePath();
			ctx.fillStyle = ArrowGrad;
			ctx.fill();
		ctx.restore();
	}
});