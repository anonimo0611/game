!(new class { // Enable mouse wheel on range controls
	setup() {
		dBody.querySelectorAll('input[type=range]')
			.forEach(ctrl=> this.setupRangeCtrl(ctrl));
	}
	vals = r=> [[r.value],[r.step,1],[r.min,0],[r.max,100]].map(a=> toNumber(...a));
	setupRangeCtrl(ctrl) { // Labels must be block-level
		const label = ctrl.closest('label') || dqs(`label[for="${ctrl.id}"]`);
		const onWheel = e=> {
			if (ctrl.disabled) {
				return;
			}
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