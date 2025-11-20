export const Cursor = new class {
	static {
		let   timerId   = 0
		const LastPos   = Vec2.Zero
		const MoveRange = 2
		const HideDelay = 2000
		document.body.addEventListener('mousemove', e=> {
			Cursor.#setPos(e)
			clearTimeout(timerId)
			timerId = setTimeout(Cursor.hide, HideDelay)
			Vec2.sqrMag(Cursor.pos,LastPos) > MoveRange**2 && Cursor.default()
			LastPos.set(Cursor.pos)
		})
	}
	#pos = Vec2.Zero
	#setPos   = (/**@type {MouseEvent}*/e)=> this.#pos.set(e.pageX,e.pageY)
	#setState = (/**@type {string}*/state)=> {dRoot.dataset.cursor = state}
	hide()    {Cursor.#setState('hidden')}
	default() {Cursor.#setState('default')}
	get pos() {return Cursor.#pos.clone}
}

/**
 Enable mouse wheel on range controls.
 Label elements must be block-level.
 @param {HTMLInputElement} ctrl
*/
function setupCtrl(ctrl) {
	const output = qS(`output[for~="${ctrl.id}"]`) ?? []
	const ids    = ctrl.dataset.links?.trim().split(/\s+/) ?? []
	const label  = ctrl.closest('label') || qS(`label[for="${ctrl.id}"]`)
	const links  = ids.map(id=> qS(`input#${id}`)).filter(e=> e!=null)

	/** @param {WheelEvent} e */
	function onWheel(e) {
		e.preventDefault()
		0 < wheelDeltaY(e)
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
	$(label || ctrl).on({wheel:onWheel})
	$(ctrl).on('input',onInput).trigger('input')
}
$load(()=> $('input[type=range]').get().forEach(setupCtrl))