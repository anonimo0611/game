import {Vec2} from './vec2.js'
export const Cursor = freeze(new class {
	hide()    {this.#setState('hidden')}
	default() {this.#setState('default')}
	#setState(state) {dRoot.dataset.cursor = state}
	static {
		let timerId=0, lstPos={x:0, y:0};
		$on('mousemove', e=> {
			clearTimeout(timerId);
			timerId = setTimeout(()=> Cursor.#setState('stayStill'), 2e3);
			const {pageX:x, pageY:y}= e;
			if (Vec2.distance(lstPos, {x, y}) > 2) Cursor.default();
			lstPos ={x, y};
		});
	}
});
!(new class { // Enable mouse wheel on range controls
	setup() {
		dBody.querySelectorAll('input[type=range]')
			.forEach(ctrl=> this.setupRangeCtrl(ctrl));
	}
	setupRangeCtrl(ctrl) { // Labels must be block-level
		const label = ctrl.closest('label') || dqs(`label[for="${ctrl.id}"]`);
		const onWheel = e=> {
			e.preventDefault()
			0 < e.deltaY
				? ctrl.stepDown()
				: ctrl.stepUp()
			$(ctrl).trigger('input')
		};
		label?.addEventListener('wheel', onWheel);
		!ctrl.closest('label') && ctrl.addEventListener('wheel', onWheel);
	}
}).setup();