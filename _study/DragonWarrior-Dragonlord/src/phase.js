import {Ticker} from '../lib/timer.js';
import {State}  from '../lib/state.js';
export const Phase = new class extends State {
	isStart    = true;
	isSelect   = false;
	isBattle   = false;
	isClear    = false;
	isGameOver = false;
	constructor() {
		super();
		this.init();
	}
	switchTo(phase) {
		super.switchTo(phase);
		$trigger(phase);
	}
}