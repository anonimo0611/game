export const Confirm = new class {
	#opened = false
	get opened() {return this.#opened}
	open(content, fn1,fn2, btnStr1='Ok',btnStr2='Cancel', cancelIdx=1) {
		if (Confirm.opened) return
		this.#append()
		const confirm = byId('confirm')
		const buttons = confirm.querySelectorAll('button')
		const cancel  = e=> {
			e.preventDefault()
			buttons[cancelIdx]?.click()
		}
		buttons.forEach((btn, i, btns)=> {
			btn.textContent = [btnStr1,btnStr2][i]
			btn.onclick   = _=> {$off(NS), Confirm.#close([fn1,fn2][i])}
			btn.onkeydown = e=> {Dir.from(e)==[R,L][i] && btns[1^i].focus()}
		})
		confirm.showModal()
		Confirm.#opened = true
		$(confirm).find('.content').text(content).end().opacity(1,500)
		$onNS(NS,'keydown',  e=> {e.key == 'Escape' && cancel(e)})
		$onNS(NS,'mousedown',e=> {e.preventDefault()})
	}
	#append() {
		const temp = byId('confirm_temp').content.cloneNode(true)
		document.body.append(temp)
	}
	#close(fn) {
		$('#confirm').opacity(0,500).on('transitionend', e=> {
			$(e.target).remove()
			isFun(fn) && fn()
			this.#opened = false
		})
	}
};const NS='.CONFIRM'