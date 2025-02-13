/** @param {string} selector */
function mouseDragScrollable(selector) {
	if ('ontouchstart' in window
		|| navigator.maxTouchPoints > 0
		|| matchMedia('(pointer:coarse)').matches
	) return

	class State {
		scrL = target.scrollLeft
		scrT = target.scrollTop
		/** @param {MouseEvent} e */
		constructor(e) {
			this.x = e.clientX
			this.y = e.clientY
		}
	}
	/** @type {?HTMLElement} */
	let target = null

	/** @type {Map<HTMLElement,State>} */
	const StateMap = new Map()

	for (const elm of document.querySelectorAll(selector)) {
		elm.addEventListener('mousedown', e=> {
			if (e.target.closest('.noDrag')) return
			target = elm
			StateMap.set(target, new State(e))
			e.stopPropagation()
		})
	}
	addEventListener('mousemove', e=> {
		if (!StateMap.has(target)) return
		const moveX = StateMap.get(target).x - e.clientX
		const moveY = StateMap.get(target).y - e.clientY
		if (moveX || moveY) {
			e.stopPropagation()
			target.scrollLeft = StateMap.get(target).scrL + moveX
			target.scrollTop  = StateMap.get(target).scrT + moveY
		}
	})
	addEventListener('mouseup', e=> {
		if (!StateMap.has(target)) return
		e.stopPropagation()
		StateMap.delete(target)
		target = null
	})
}
mouseDragScrollable('html')