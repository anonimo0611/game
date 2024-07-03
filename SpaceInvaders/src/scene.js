import {Ticker} from '../lib/timer.js';
import {Timer}  from '../lib/timer.js';
import {State}  from '../lib/state.js';
export const Scene = new class extends State {
	isTitle    = true;
	isStart    = false;
	isIntro    = false;
	isInGame   = false;
	isClear    = false;
	isNewRound = false;
	isDestroy  = false;
	isRespawn  = false;
	isGameOver = false;
	constructor() {
		super();
		this.init();
	}
	switchTo(scene, delay) {
		if (isNum(delay)) {
			Timer.set(delay, ()=> Scene.switchTo(scene));
			return;
		}
		super.switchTo(scene);
		$trigger(scene);
		Ticker.resetCount();
	}
}