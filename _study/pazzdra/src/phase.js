import {State} from '../lib/state.js';
export const Phase = freeze(new class extends State {
	isIdle   = true;
	isSwap   = false;
	isRemove = false;
	isFall   = false;
	constructor() {
		super();
		this.init();
	}
	switchTo(state) {
		super.switchTo(state);
		$trigger(state);
	}
});