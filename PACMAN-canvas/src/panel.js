
const btns = /**@type {HTMLButtonElement[]}*/
	(qSAll('button.panelBtn'))

for (const btn of btns) {
	btn.addEventListener('pointerdown', ()=> {
		$('.panel').toggle()
		btn.classList.toggle('opened')
	})
	addEventListener('pointerdown', e=> {
		const tgt = /**@type {HTMLElement}*/(e.target)
		if (!btn.offsetParent
		 || tgt == btn
		 || tgt.closest?.(btn.value))
			return
		$(btn.value).hide()
		btn.classList.remove('opened')
	})
} $ready(()=> $('.panel').hide())