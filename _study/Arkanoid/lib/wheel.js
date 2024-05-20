const dBody = document.body;
!({ // Enable mouse wheel on range controls
	setup(trg) {
		trg == dBody && $('form').on('reset', e=> this.setup(e.target))
		$(trg).find('input[type=range]').get().forEach(i=> this.setupRangeCtrl(i,trg))
	},
	vals:r=> [[r.value],[r.step,1],[r.min,0],[r.max,100]].map(a=>toNumber(...a)),
	setupRangeCtrl(ctrl,root) {
		// Labels must be block-level, e.g. 'display:inline-block'
		const label   = ctrl.closest('label') || dqs(`label[for="${ctrl.id}"]`)
		const ids     = ctrl.dataset.links?.trim().split(/\s+/) || []
		const links   = new Set(ids.flatMap(id=> byId(id) ?? []))
		const output  = dqs(`output[for~="${ctrl.id}"]`)
		const onInput = _=> {$([...links,output || []]).prop({value:ctrl.value})}
		const onWheel = e=> {
			if (ctrl.disabled) return
			else e.preventDefault()
			const [val,step,min,max]= this.vals(ctrl)
			const sigD = step.toString().split('.')[1]?.length ?? 0
			const cval = +(val + (0 < e.deltaY ? -step : step)).toFixed(sigD)
			ctrl.value = clamp(cval, min, max)
			between(cval, min, max) && $(ctrl).trigger('input')
		}
		if (root != dBody && output)
			return void output?.text(+ctrl.defaultValue)
		$(ctrl).on('input', onInput) && $(output).text(ctrl.value)
		label?.addEventListener('wheel', onWheel)
		!ctrl.closest('label') && ctrl.addEventListener('wheel', onWheel)
	}
}).setup(dBody)