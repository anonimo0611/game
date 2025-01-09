function mouseDragScrollable(element) {
	if ('ontouchstart' in window
		|| navigator.maxTouchPoints > 0
		|| window.matchMedia('(pointer:coarse)').matches
	) return
	let target
	const StateMap = new Map()
	for (const elm of document.querySelectorAll(element)) {
		elm.addEventListener('mousedown', function(e) {
			if (e.target.closest('.noDrag')) return
			target = elm
			StateMap.set(target, new class {
				down = true
				move = false
				x    = e.clientX
				y    = e.clientY
				scrL = target.scrollLeft
				scrT = target.scrollTop
			})
			e.stopPropagation()
		})
		elm.addEventListener('click', e=> {
			StateMap.has(elm)
				&& StateMap.get(elm).move
				&& e.stopPropagation()
		})
	}
	document.addEventListener('mousemove', e=> {
		if (!StateMap.get(target)?.down) return
		let moveX = StateMap.get(target).x - e.clientX
		let moveY = StateMap.get(target).y - e.clientY
		if (moveX !== 0
		 || moveY !== 0) StateMap.get(target).move = true
		else return
		target.scrollLeft = StateMap.get(target).scrL + moveX
		target.scrollTop  = StateMap.get(target).scrT + moveY
		e.stopPropagation()
	})
	document.addEventListener('mouseup', e=> {
		if (!StateMap.get(target)?.down) return
		StateMap.get(target).down = false
		e.stopPropagation()
	})
}
addEventListener('DOMContentLoaded', ()=> mouseDragScrollable('html'))