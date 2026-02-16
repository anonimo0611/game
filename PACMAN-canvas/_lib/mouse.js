const dRoot = document.documentElement

/** Automatically hides the cursor after a period of inactivity. */
export const Cursor = function() {
	let   timerId   = 0
	const threshold = 2
	const hideDelay = 2000
	const currPos   = Vec2.Zero
	const lastPos   = Vec2.Zero
	addEventListener('mousemove', e=> {
		currPos.set(e.pageX,e.pageY)
		clearTimeout(timerId)
		timerId = setTimeout(Cursor.hide,hideDelay)
		Vec2.sqrMag(currPos,lastPos) > threshold**2 && Cursor.show()
		lastPos.set(currPos)
	}, {passive:true})
	return {
		get pos() {return currPos.asObj},
		hide() {dRoot.dataset.cursor = 'hidden'},
		show() {dRoot.dataset.cursor = 'default'},
	}
}()

/**
 Enables mouse wheel interactions for range input elements.
 @param {HTMLInputElement} ctrl
*/
function setupRngCtrl(ctrl) {
	const output = $(`output[for~="${ctrl.id}"]`).text(ctrl.value).get(0)
	const ids    = ctrl.dataset.links?.trim().split(/\s+/) ?? []
	const label  = ctrl.closest('label') || qS(`label[for="${ctrl.id}"]`)
	const links  = ids.map(id=> qS(`input#${id}`)).filter(e=> e != null)
	const target = [...new Set([ctrl,output,...links])].filter(e=> e != null)

	$(label || ctrl).onWheel(e=> {
		e.preventDefault()
		0 < e.deltaY
			? ctrl.stepDown()
			: ctrl.stepUp()
		$(ctrl).trigger('input')
	})
	$(ctrl).on('input', ()=> {
		const {value,min,max}= ctrl
		$(target)
			.prop({value})
			.css('--ratio',`${norm(+min,+max,+value)*100}%`)
	})
	.trigger('input')
}
$load(()=> {
	/**@type {NodeListOf<HTMLInputElement>}*/
	(qSAll('input[type=range]')).forEach(setupRngCtrl)
})