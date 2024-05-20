import {Ticker} from '../lib/timer.js';
import {State}  from '../lib/state.js';
export const Scene = new class extends State {
	isDemo   = true;
	isInGame = false;
	constructor() {
		super();
		this.init();
	}
	switch(scene, delay) {
		if (isNum(delay)) {
			Ticker.Timer.set(delay, _=> Scene.switch(scene));
			return;
		}
		super.switch(scene);
		$trigger(scene);
		Ticker.resetCount();
	}
}