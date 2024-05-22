import {State} from '../lib/state.js';
export const Scene = new class extends State {
	isTitle    = true;
	isStart    = false;
	isInGame   = false;
	isGameOver = false;
	constructor() {
		super();
		this.init();
	}
	switchTo(scene) {
		super.switchTo(scene);
		$trigger(scene);
	}
};