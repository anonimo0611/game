import {L,R} from './direction.js'
export const Confirm = freeze(new class {
	#opened = false
	get opened() {return this.#opened}
	get #btns()  {return byId('confirm')?.querySelectorAll('button')}
	get #temp()  {return byId('confirm_temp').content.cloneNode(true)}
	open(content, fn1,fn2, btnStr1='Ok',btnStr2='Cancel', cancelIdx=1) {
		if (Confirm.opened) return
		document.body.append(this.#temp)
		this.#opened = true
		this.#btns.forEach((btn, i, btns)=> {
			btn.textContent = [btnStr1,btnStr2][i]
			btn.onclick   = ()=> {$off(NS),this.#close([fn1,fn2][i])}
			btn.onkeydown = ev=> {ev.key==`Arrow${[R,L][i]}` && btns[1^i].focus()}
		})
		byId('confirm').showModal()
		$on(`keydown${NS}`,  ev=> {ev.key=='Escape' && this.#cancel(ev,cancelIdx)})
		$on(`mousedown${NS}`,ev=> {ev.preventDefault()})
		$('#confirm').find('.content').text(content).end().opacity(1,500)
	}
	#cancel(ev, idx) {
		ev.preventDefault()
		this.#btns[idx]?.click()
	}
	#close(fn) {
		$('#confirm').opacity(0,500).on('transitionend', ev=> {
			$(ev.target).remove()
			isFun(fn) && fn()
			this.#opened = false
		})
	}
});const NS='.CONFIRM'