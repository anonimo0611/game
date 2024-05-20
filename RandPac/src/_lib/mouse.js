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
	vals = r=> [[r.value],[r.step,1],[r.min,0],[r.max,100]].map(a=> toNumber(...a));
	setupRangeCtrl(ctrl) { // Labels must be block-level
		const label = ctrl.closest('label') || dqs(`label[for="${ctrl.id}"]`);
		const onWheel = e=> {
			if (ctrl.disabled) return;
			e.preventDefault();
			const [val,step,min,max]= this.vals(ctrl);
			const sigD = String(step).split('.')[1]?.length ?? 0;
			const cval = Number(val + (0 < e.deltaY ? -step : step)).toFixed(sigD);
			ctrl.value = clamp(cval, min, max);
			between(cval, min, max) && ctrl.trigger('input');
		};
		label?.addEventListener('wheel', onWheel);
		!ctrl.closest('label') && ctrl.addEventListener('wheel', onWheel);
	}
}).setup();