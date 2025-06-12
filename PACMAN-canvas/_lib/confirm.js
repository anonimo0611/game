import {Dir} from './direction.js'
export const Confirm = new class {
	#cancel = 0
	#opened = false
	get opened()   {return this.#opened}
	get #tempElm() {return /**@type {HTMLTemplateElement}*/(byId('confirm_t'))}
	get #confirm() {return /**@type {HTMLDialogElement}  */(byId('confirm'))}

	/** @param {MouseEvent} e */
	#onMousedown = e=> {e.preventDefault()}

	/** @param {KeyboardEvent} e */
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
	 * @param {string} content
	 * @param {?Function} fn1
	 * @param {?Function} fn2
	 * @param {string} [btnTxt1]
	 * @param {string} [btnTxt2]
	 * @param {0|1} [cancelIdx]
	 */
	open(content, fn1,fn2, btnTxt1='Ok',btnTxt2='Cancel', cancelIdx=1) {
		if (this.opened) return
		document.body.append(this.#tempElm.content.cloneNode(true))
		this.#opened = true
		this.#cancel = cancelIdx
		$('#confirm').find('button').each((i,btn)=> {
			btn.textContent = [btnTxt1,btnTxt2][i]
			btn.onclick = ()=> {$off(NS),this.#remove([fn1,fn2][i])}
		})
		$onNS(NS,{keydown:  this.#onKeydown})
		$onNS(NS,{mousedown:this.#onMousedown})
		$(this.#confirm).find('.content').text(content)
		$(this.#confirm).fadeIn(300).get(0)?.showModal()
	}

	/** @param {?Function} fn */
	#remove(fn) {
		$('#confirm').fadeOut(300, function() {
			this.remove(), fn?.()
			Confirm.#opened = false
		})
	}
};const NS='.CONFIRM'