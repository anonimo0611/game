export const Cursor = new class {
	hide()    {this.#setState('hidden')}
	default() {this.#setState('default')}
	/** @param {string} state */
	#setState(state) {dRoot.dataset.cursor = state}
	static {
		let timerId=0, lstPos={x:0, y:0}
		$on('mousemove', e=> {
			clearTimeout(timerId)
			timerId = setTimeout(()=> Cursor.#setState('stayStill'), 2e3)
			const {pageX:x, pageY:y}= e
			Vec2.distance(lstPos,{x,y}) > 2 && Cursor.default()
			lstPos = {x,y}
		})
	}
}

/** @param {HTMLInputElement} ctrl */
function setupCtrl(ctrl) {
	// Enable mouse wheel on range controls
	// Label elements must be block-level
	const output = dqs(`output[for~="${ctrl.id}"]`) ?? []
	const ids    = ctrl.dataset.links?.trim().split(/\s+/) ?? []
	const label  = ctrl.closest('label') || dqs(`label[for="${ctrl.id}"]`)
	const links  = new Set(ids.flatMap(id=> dqs(`input#${id}`) ?? []))

	/** @param {WheelEvent} e */
	function onWheel(e) {
		e.preventDefault()
		0 < e.deltaY
			? ctrl.stepDown()
			: ctrl.stepUp()
		$(ctrl).trigger('input')
	}
	function onInput() {
		const {value,min,max}= ctrl
		$([ctrl,output, ...links])
			.prop({value})
			.css({'--ratio':`${norm(min,max,value)*100}%`})
	}
	$(output).text(ctrl.value)
	$(ctrl).on('input',onInput).trigger('input')
	;(label || ctrl).addEventListener('wheel',onWheel)
}
document.body.querySelectorAll('input[type=range]').forEach(setupCtrl)