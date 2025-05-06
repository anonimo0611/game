export const Cursor = new class {
	static {
		let timerId = 0, lstPos = {x:0, y:0}
		$('body').on('mousemove', e=> {
			//Hide cursor if not moved for 2 secs
			clearTimeout(timerId)
			timerId = setTimeout(()=> Cursor.#setState('hidden'), 2e3)
			const {pageX:x, pageY:y}= e
			Vec2.distance(lstPos,{x,y}) > 2 && Cursor.default()
			lstPos = {x,y}
		})
	}
	hide()    {this.#setState('hidden')}
	default() {this.#setState('default')}

	/** @param {'default'|'hidden'} state */
	#setState(state) {dRoot.dataset.cursor = state}
}

/** @param {HTMLInputElement} ctrl */
function setupCtrl(ctrl) {
	// Enable mouse wheel on range controls
	// Label elements must be block-level
	const output = qS(`output[for~="${ctrl.id}"]`) ?? []
	const ids    = ctrl.dataset.links?.trim().split(/\s+/) ?? []
	const label  = ctrl.closest('label') || qS(`label[for="${ctrl.id}"]`)
	const links  = ids.map(id=> qS(`input#${id}`)).filter(isObj)

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
		$([ctrl,output, ...new Set(links)])
			.prop({value})
			.css({'--ratio':`${norm(+min,+max,+value)*100}%`})
	}
	$(output).text(ctrl.value)
	$(ctrl).on('input',onInput).trigger('input')
	;(label || ctrl).addEventListener('wheel',onWheel)
}
document.body.querySelectorAll('input[type=range]').forEach(setupCtrl)