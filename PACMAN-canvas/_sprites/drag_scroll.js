(function() {
	if ('ontouchstart' in window
		|| navigator.maxTouchPoints > 0
		|| matchMedia('(pointer:coarse)').matches
	) return

	document.body.classList.add('dragScrollEnabeld')

	class State {
		scrL = target?.scrollLeft ?? 0
		scrT = target?.scrollTop  ?? 0
		constructor(/**@type {MouseEvent}*/e) {
			this.x = e.clientX
			this.y = e.clientY
		}
	}
	let   target   = /**@type {?HTMLElement}*/(null)
	const StateMap = /**@type {Map<HTMLElement,State>}*/(new Map)

	addEventListener('mousedown', e=> {
		if (e.target instanceof HTMLElement) {
			if (e.buttons != 1) return
			if (e.target.closest('.noDrag')) return
			target = document.documentElement
			StateMap.set(target, new State(e))
			e.stopPropagation()
		}
	})
	addEventListener('mousemove', e=> {
		if (!target) return
		let tgt = StateMap.get(target)
		if (tgt) {
			const moveX = tgt.x - e.clientX
			const moveY = tgt.y - e.clientY
			if (moveX || moveY) {
				e.stopPropagation()
				target.scrollLeft = tgt.scrL + moveX
				target.scrollTop  = tgt.scrT + moveY
			}
		}
	})
	addEventListener('mouseup', e=> {
		if (!target) return
		e.stopPropagation()
		StateMap.delete(target)
		target = null
	})
})()