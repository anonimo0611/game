const dBody = document.body;
!(new class { // Enable mouse wheel on range controls
	setup(trg) {
		trg == dBody && $('form').on('reset', e=> this.setup(e.target))
		trg.querySelectorAll('input[type=range]').forEach(i=> this.setupRangeCtrl(i,trg))
	}
	vals = r=> [[r.value],[r.step,1],[r.min,0],[r.max,100]].map(a=>toNumber(...a))
	setupRangeCtrl(ctrl,root) { // Labels must be block-level
		const ids     = ctrl.dataset.links?.trim().split(/\s+/) ?? []
		const label   = ctrl.closest('label') || dqs(`label[for="${ctrl.id}"]`)
		const output  = dqs(`output[for~="${ctrl.id}"]`) ?? []
		const ctrlSet = new Set(ids.flatMap(id=> dqs(`input#${id}`) ?? []))
		const onInput = _=> {$([...ctrlSet,output]).prop({value:ctrl.value})}
		const onWheel = e=> {
			if (ctrl.disabled) return
			e.preventDefault()
			const [val,step,min,max]= this.vals(ctrl)
			const sigD = String(step).split('.')[1]?.length ?? 0
			const cval = Number(val + (0 < e.deltaY ? -step : step)).toFixed(sigD)
			ctrl.value = clamp(cval, min, max)
			between(cval, min, max) && ctrl.trigger('input')
		}
		if (root != dBody) return $(output).text(+ctrl.defaultValue)
		ctrl.on('input', onInput) && $(output).text(ctrl.value)
		label?.addEventListener('wheel', onWheel)
		!ctrl.closest('label') && ctrl.addEventListener('wheel', onWheel)
	}
}).setup(dBody)