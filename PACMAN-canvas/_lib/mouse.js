const dRoot = document.documentElement
export const Cursor = new class {
	constructor() {
		let   timerId   = 0
		const LastPos   = Vec2.Zero
		const MoveRange = 2
		const HideDelay = 2000
		addEventListener('mousemove', e=> {
			this.#setPos(e)
			clearTimeout(timerId)
			timerId = setTimeout(()=> this.hide(), HideDelay)
			Vec2.sqrMag(this.pos,LastPos) > MoveRange**2 && this.default()
			LastPos.set(this.pos)
		}, {passive:true})
	}
	#pos = Vec2.Zero
	#setPos   = (/**@type {MouseEvent}*/e)=> this.#pos.set(e.pageX,e.pageY)
	#setState = (/**@type {string}*/state)=> {dRoot.dataset.cursor = state}
	hide()    {this.#setState('hidden')}
	default() {this.#setState('default')}
	get pos() {return this.#pos.clone}
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
$load(()=> {
	/**@type {HTMLInputElement[]}*/
	($('input[type=range]').get()).forEach(setupCtrl)
})