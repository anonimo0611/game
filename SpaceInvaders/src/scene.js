import {Ticker} from '../lib/timer.js';
import {Timer}  from '../lib/timer.js';
import {State}  from '../lib/state.js';
export const Scene = new class extends State {
	isTitle    = true;
	isIntro    = false;
	isInGame   = false;
	isDestroy  = false;
	isRespawn  = false;
	isGameOver = false;
	isClear    = false;
	constructor() {
		super();
		this.init();
	}
	switchTo(scene, delay) {
		if (isNum(delay))
			return void Timer.set(delay, _=> Scene.switchTo(scene));
		super.switchTo(scene);
		$trigger(scene);
		Ticker.resetCount();
	}
}