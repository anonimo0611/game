const dRoot = document.documentElement

/** Automatically hides the cursor after a period of inactivity. */
export const Cursor = function() {
	let   timerId   = 0
	const Threshold = 2
	const HideDelay = 2000
	const CurrPos   = Vec2.Zero
	const LastPos   = Vec2.Zero
	addEventListener('mousemove', e=> {
		CurrPos.set(e.pageX,e.pageY)
		clearTimeout(timerId)
		timerId = setTimeout(hide,HideDelay)
		Vec2.sqrMag(CurrPos,LastPos) > Threshold**2 && show()
		LastPos.set(CurrPos)
	}, {passive:true})
	function hide() {dRoot.dataset.cursor = 'hidden'}
	function show() {dRoot.dataset.cursor = 'default'}
	return {get pos() {return CurrPos.asObj},hide,show}
}()

/**
 Enables mouse wheel interactions for range input elements.
 @param {HTMLInputElement} ctrl
*/
function setupRngCtrl(ctrl) {
	const output = $(`output[for~="${ctrl.id}"]`).text(ctrl.value).get(0) ?? ''
	const ids    = ctrl.dataset.links?.trim().split(/\s+/) ?? []
	const label  = ctrl.closest('label') || qS(`label[for="${ctrl.id}"]`)
	const links  = ids.map(id=> qS(`input#${id}`)).filter(e=> e!=null)

	$(label || ctrl).onWheel(e=> {
		e.preventDefault()
		0 < e.deltaY
			? ctrl.stepDown()
			: ctrl.stepUp()
		$(ctrl).trigger('input')
	})
	$(ctrl).on('input', ()=> {
		const {value,min,max}= ctrl
		$([...new Set([ctrl,output,...links])])
			.prop({value})
			.css('--ratio',`${norm(+min,+max,+value)*100}%`)
	})
	.trigger('input')
}
$load(()=> {
	/**@type {NodeListOf<HTMLInputElement>}*/
	(qSAll('input[type=range]')).forEach(setupRngCtrl)
})