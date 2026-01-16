const dRoot = document.documentElement

export const Cursor = function() {
	let   timerId   = 0
	const MoveRange = 2
	const HideDelay = 2000
	const currPos   = Vec2.Zero
	const LastPos   = Vec2.Zero
	addEventListener('mousemove', e=> {
		currPos.set(e.pageX,e.pageY)
		clearTimeout(timerId)
		timerId = setTimeout(hide,HideDelay)
		Vec2.sqrMag(currPos,LastPos) > MoveRange**2 && show()
		LastPos.set(currPos)
	}, {passive:true})
	function hide() {dRoot.dataset.cursor = 'hidden'}
	function show() {dRoot.dataset.cursor = 'default'}
	return {get pos() {return currPos.asObj},hide,show}
}()

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
	/**@type {NodeListOf<HTMLInputElement>}*/
	(qSAll('input[type=range]')).forEach(setupCtrl)
})