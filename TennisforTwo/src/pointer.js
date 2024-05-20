import {cvs,ctx} from './canvas.js';
import {Scene}   from './scene.js';
import {$scale}  from './canvas.js';
import {Pause}   from './pause.js';
import {Score}   from './score.js';
import {Color}   from './colors.js';
import {Court}   from './court.js';
import {Player}  from './player.js';
import {Player1} from './player.js';
import {Vec2}    from '../lib/vec2.js';
import {Ball}    from './ball.js';
import {Button}  from './buttons.js';

let $touchMoving = false;

export const Pointer = freeze(new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({
			Serve: ()=> $touchMoving = false,
			mousemove:  Pointer.setPosition,
			touchmove:  Pointer.setPosition,
			touchend:   Pointer.#touchEnd,
			pointerdown:Pointer.#onDown,
			contextmenu:Pointer.#onContextmenu,
		});
		$(Pause).on({shot:Pointer.#shot});
	}
	Pos = Vec2();
	get isTouchDevice() {
		return 'ontouchstart' in window;
	}
	get xPct() {
		return abs(((Pointer.Pos.x/cvs.width)-.5)*2 * 100);
	}
	get yPctOfBetweenNetToTop() {
		return (1-(Pointer.Pos.y/Court.NetTopY)) * 100;
	}
	setPosition(e) {
		const rect = cvs.getBoundingClientRect();
		e.preventDefault();
		e = e.touches?.[0] || e;
		Pointer.Pos.x = (e.pageX - rect.left) / $scale;
		Pointer.Pos.y = (e.pageY - rect.top)  / $scale;
	}
	#onDown(e) {
		Pointer.setPosition(e);
		if (Button.hover)
			return;
		if (!Scene.isInGame) {
			e.target == cvs && Scene.switchToStart();
			return;
		}
		Pointer.isTouchDevice
			? ($touchMoving = true)
			: Pointer.#shot();
	}
	#onContextmenu(e) {
		e.preventDefault();
	}
	#touchEnd() {
		if (!Scene.isInGame) return;
		$touchMoving && Pointer.#shot();
		$touchMoving = false;
	}
	#shot() {
		if (Pause.paused) return;
		if (Ball.Side == Player.Side.One && !Player1.shotAlready)
			!Score.waiting && Player1.shot();
	}
	draw() {
		if (Pointer.isTouchDevice && !$touchMoving) return;
		if (!Scene.isInGame || !Pause.showPointer) return;
		drawLine(ctx, {color:Color.PinkRGBA})
			(...Ball.Pos.vals, ...Pointer.Pos.vals);
	}
});