import {Ticker} from '../lib/timer.js';
import {State}  from '../lib/state.js';
export const Scene = freeze(new class extends State {
	isReset    = true;
	isReady    = false;
	isInDemo   = false;
	isInGame   = false;
	isClear    = false;
	isDemoEnd  = false;
	isDropped  = false;
	isRespawn  = false;
	isGameOver = false;
	constructor() {
		super();
		this.init();
	}
	switchTo(scene, delay) {
		if (isNum(delay)) {
			Ticker.Timer.set(delay, _=> Scene.switchTo(scene));
			return;
		}
		super.switchTo(scene);
		$trigger(scene);
		Ticker.resetCount();
	}
});