import {State} from './_lib/state.js';
export const Scene = new class extends State {
	isTitle    = true;
	isReset    = false;
	isStart    = false;
	isRespawn  = false;
	isPlaying  = false;
	isLosing   = false;
	isGameOver = false;
	isClear    = false;
	constructor() {
		super();
		this.init();
	}
	switch(scene, data) {
		super.switch(scene);
		$trigger(dBody.id=scene, data);
		$(this).trigger('change', scene);
	}
};