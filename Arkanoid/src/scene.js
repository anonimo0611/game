import {Ticker} from '../lib/timer.js';
import {State}  from '../lib/state.js';
export const Scene = freeze(new class extends State {
	isReset    = true;
	isStart    = false;
	isReady    = false;
	isInDemo   = false;
	isInGame   = false;
	isClear    = false;
	isEndDemo  = false;
	isDropped  = false;
	isRespawn  = false;
	isGameOver = false;
	constructor() {
		super();
		this.init();
	}
	switchTo(scene, delay) {
		if (isNum(delay)) {
			Ticker.Timer.set(delay, ()=> Scene.switchTo(scene));
			return;
		}
		super.switchTo(scene);
		$trigger(scene);
		Ticker.resetCount();
	}
});