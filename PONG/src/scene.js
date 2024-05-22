import {Ticker} from '../lib/timer.js';
import {State}  from '../lib/state.js';
export const Scene = new class extends State {
	isDemo   = true;
	isInGame = false;
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
}