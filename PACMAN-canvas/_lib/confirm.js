import {Dir} from './direction.js'
export const Confirm = new class {
	#cancel = /**@type {0|1}*/(0)
	#opened = false
	get opened()   {return this.#opened}
	get #tempElm() {return /**@type {HTMLTemplateElement}*/(byId('confirm_t'))}
	get #confirm() {return /**@type {HTMLDialogElement}  */(byId('confirm'))}

	/** @param {JQuery.KeyboardEventBase} e */
	#onKeydown(e) {
		const btns = $('#confirm button').get()
		if (e.key == 'Escape') {
			e.preventDefault()
			return btns[Confirm.#cancel].click()
		}
		if (e.target instanceof HTMLButtonElement) {
			const i = $(e.target).index()
			Dir.from(e) == [R,L][i] && btns[1^i].focus()
		}
	}

	/**
	 @param {string} content   Dialog description
	 @param {?Function} fn1    Functions to assign to the left button
	 @param {?Function} fn2    Functions to assign to the right button
	 @param {string} [btn1Txt] Text of the left  button
	 @param {string} [btn2Txt] Text of the right button
	 @param {0|1} [cancelIdx]  Button to assign when canceling; 0=left(default), 1=right
	 @param {0|1} [autoFocus]  0=left, 1=right; The default is the same as `cancelIdx`
	*/
	open(content, fn1,fn2, btn1Txt='Cancel',btn2Txt='Ok', cancelIdx=0, autoFocus=cancelIdx) {
		if (this.opened) return
		this.#opened = true
		this.#cancel = cancelIdx
		document.body.append(this.#tempElm.content.cloneNode(true))
		$(this.#confirm).find('.content').text(content)
		$('#confirm').find('button').each((i,btn)=> {
			if (i == autoFocus) btn.autofocus = true
			btn.classList.add(i == cancelIdx ? 'cancel':'ok')
			btn.textContent = [btn1Txt,btn2Txt][i]
			btn.onclick = ()=> {$off(NS),this.#remove([fn1,fn2][i])}
		})
		$(this.#confirm).fadeIn(300).get(0)?.showModal()
		$onNS(NS,{keydown:this.#onKeydown})
		$onNS(NS,{pointerdown:e=> e.preventDefault()})
	}
	/** @param {?Function} fn */
	#remove(fn) {
		$('#confirm').fadeOut(300, function() {
			this.remove(), fn?.()
			Confirm.#opened = false
		})
	}
};const NS='.CONFIRM'