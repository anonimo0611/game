/** @type {NodeListOf<HTMLButtonElement>} */
const btns = dqsAll('.panelBtn')
for (const btn of btns) {
	btn.addEventListener('pointerdown', ()=> {
		$('.panel').toggle()
		btn.classList.toggle('opened')
	})
	addEventListener('pointerdown', e=> {
		if (!btn.offsetParent
		 || e.target == btn
		 || e.target.closest?.(btn.value))
			return
		$(btn.value).hide()
		btn.classList.remove('opened')
	})
} $('.panel').hide()