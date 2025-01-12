!(new class { // Enable mouse wheel on range controls
	setup() {
		document.body.querySelectorAll('input[type=range]')
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