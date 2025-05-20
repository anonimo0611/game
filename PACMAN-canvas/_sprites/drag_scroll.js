/** @param {string} selector */
(function(selector) {
	if ('ontouchstart' in window
		|| navigator.maxTouchPoints > 0
		|| matchMedia('(pointer:coarse)').matches
	) return

	document.body.classList.add('dragScrollEnabeld')

	class State {
		scrL = target?.scrollLeft
		scrT = target?.scrollTop
		/** @param {MouseEvent} e */
		constructor(e) {
			this.x = e.clientX
			this.y = e.clientY
		}
	}
	/** @type {HTMLElement|object} */
	let target = null

	/** @type {Map<HTMLElement,State>} */
	const StateMap = new Map()

	for (const elm of qSAll(selector)) {
		elm.addEventListener('mousedown', e=> {
			if (isNotDrag(e) || e.buttons != 1)
				return
			target = elm
			StateMap.set(target, new State(e))
			e.stopPropagation()
		})
	}
	addEventListener('mousemove', e=> {
		const tgt = StateMap.get(target)
		if (!tgt) return
		const moveX = tgt.x - e.clientX
		const moveY = tgt.y - e.clientY
		if (moveX || moveY) {
			e.stopPropagation()
			target.scrollLeft = tgt.scrL + moveX
			target.scrollTop  = tgt.scrT + moveY
		}
	})
	addEventListener('mouseup', e=> {
		if (!StateMap.get(target))
			return
		e.stopPropagation()
		StateMap.delete(target)
		target = null
	})
})('html')

/** @param {MouseEvent} e */
const isNotDrag = e=> /**@type {Element}*/(e.target).closest('.noDrag')
addEventListener('wheel',e=>{isNotDrag(e) && e.preventDefault()}, {passive:false})