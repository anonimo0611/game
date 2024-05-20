import {Timer}   from '../lib/timer.js';
import {Vec2}    from '../lib/vec2.js';
import {Sound}   from '../snd/sound.js';
import {ctx}     from './canvas.js';
import {Scene}   from './scene.js';
import {Pause}   from './pause.js';
import {Message} from './message.js';
import {Pointer} from './pointer.js';
import {Court}   from './court.js';
import {Ball}    from './ball.js';
import {ComPointer} from './comPointer.js';

const Side = freeze({One:0, Two:1, Max:2});
const ServePosList = freeze([
	Vec2(Court.ServeOneX, Court.NetTopY).freeze(), // Side.One
	Vec2(Court.ServeTwoX, Court.NetTopY).freeze()  // Side.Two
]);
let $serving  = true;
let $current  = Side.One;
let $receiver = -1;
let $nextTurn = -1;

export const Player = new class {
	static {$on({Title:this.#init})}
	static #init() {
		$serving  = true;
		$current  = Side.One;
		$receiver = -1;
		$nextTurn = -1;
	}
	get Side()     {return Side}
	get current()  {return $current}
	get serving()  {return $serving}
	get receiver() {return $receiver}
	get nextTurn() {return $nextTurn}
	#reset() {
		$current  = Ball.Side;
		$nextTurn = -1;
	}
	setServe(server) {
		$serving  = true;
		$receiver = server^1;
		$trigger('Serve');
		Timer.cancelAll();
		Player.#reset();
		Ball.Pos.set(ServePosList[server]);
		Ball.Velocity.set();
		ComPointer.reset(server, ServePosList[Side.Two].x);
		if (Scene.isTitle || server == Side.Two)
			Timer.set(1500, ()=> $(Com).trigger('serve'));
	}
	draw() {
		if (Pause.paused) return;
		if (Scene.isInGame && $serving)
			Message.draw((Ball.Side? "COM's":'YOUR')+'\u2002SERVING');
	}
};
function shot(v) {
	if ($receiver == $nextTurn) {
		if (Ball.boundCnt == 0) return;
		$receiver = -1;
	}
	if ($serving) v.mul(1.6)
	Ball.Velocity.set(v.mul(1.8));
	$serving  = false;
	$current  = Ball.Side;
	$nextTurn = $current^1;
	Timer.cancelAll();
	Sound.play('shot');
	$(Player).trigger('shot');
}

export const Player1 = new class {
	get shotAlready() {return $nextTurn == Side.Two}
	shot() {
		const v = Vec2.sub(Ball.Pos, Pointer.Pos);
		const p = min(Vec2.distance(Ball.Pos, Pointer.Pos)*.04, 8);
		shot(v.normalized.mul(v.y > 0 ? p*1.4 : p));
	}
}
export const Com = new class {
	static {$ready(this.#setup)}
	static #setup() {$(Com).on({serve:Com.#serve})}
	get HeightLimit() {return 20}
	get Pointer()     {return ComPointer}
	get shotAlready() {return $nextTurn == Side.One}
	#shot(vx=0, vy=0, rate=1) {
		if (Ball.yPctOfBetweenNetToTop >= Com.HeightLimit) return;
		const v = Vec2(vx, vy).mul(rate);
		Ball.Side == Side.One && (v.x *= -1);
		shot(v);
	}
	#serve() {
		Com.#shot(-2.0, -0.5, randFloat(3.8, 4.2));
	}
	smashOrDrop() {
		Ball.xPct >= 50 && Ball.yPctOfBetweenNetToTop > randFloat(4, 10)
			? Com.#smash()
			: Ball.xPct <= 20
				? Timer.set(randInt( 4,   6), Com.#drop)
				: Timer.set(randInt(10, 300), Com.#smash);
	}
	groundSmash() {
		if (Ball.yPctOfBetweenNetToTop <= randFloat(6, 15)) return;
		Ball.xPct <= 75
			? Com.#shot(-2, 0.1, 6)
			: Com.#shot(-2, 0.0, 7);
	}
	stroke() {
		Ball.xPct <= 70
			? randInt(0, 1) && Timer.set(randInt(200, 600), Com.#strokeOrVolley)
			: randInt(0, 1) && Timer.set(randInt(100, 200), Com.#strokeOrVolley);
	}
	volley() {
		if (Ball.xPct < randInt(Ball.xPct, 75, 100)) return;
		if (Ball.yPctOfBetweenNetToTop > 6.82) return;
		Com.#strokeOrVolley();
	}
	#strokeOrVolley() {
		if (Ball.xPct <= 33) {
			Com.#shot(-1.2, -0.8, randFloat(2.7, 2.8));
			return;
		}
		const rate = Ball.xPct <= 75
			? randFloat(3.4, 3.6)
			: randFloat(3.8, 4.0);
		randInt(0, 1) && Com.#shot(-1.7, -0.6, rate);
	}
	#smash() {
		if (Ball.yPctOfBetweenNetToTop >= 22) return;
		if (Ball.yPctOfBetweenNetToTop <= 10) return;
		if (Ball.xPct < 20) return;
		Com.#shot(-2.0, 0.2, 6);
	}
	#drop() {
		if (Ball.yPctOfBetweenNetToTop >= 22) return;
		if (Ball.yPctOfBetweenNetToTop <= 16) return;
		randInt(0, 3)
			? Com.#shot(-5.2, randFloat(4, 6))
			: Com.#shot(-9, 8);
	}
}