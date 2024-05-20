import {Ticker} from '../lib/timer.js';
import {State}  from '../lib/state.js';
export const Scene = freeze(new class extends State {
	isReset    = true;
	isReady    = false;
	isInDemo   = false;
	isInGame   = false;
	isClear    = false;
	isDropped  = false;
	isRespawn  = false;
	isGameOver = false;
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
});