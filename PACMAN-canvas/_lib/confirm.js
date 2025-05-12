import {Dir} from './direction.js'
export const Confirm = new class {
	#opened = false
	#cancelIdx = 0
	get opened() {return this.#opened}

	get #tempElm() {return /**@type {HTMLTemplateElement}*/(byId('confirm_t'))}
	get #buttons() {return byId('confirm')?.querySelectorAll('button')}

	/** @param {MouseEvent} e */
	#onMousedown = e=> {e.preventDefault()}

	/** @param {KeyboardEvent} e */
	#onKeydown(e) {
		const btns = asNotNull(Confirm.#buttons)
		if (e.key == 'Escape') {
			e.preventDefault()
			return btns[Confirm.#cancelIdx].click()
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
	 */
	open(content, fn1,fn2, btnTxt1='Ok',btnTxt2='Cancel', cancelIdx=1) {
		if (Confirm.#opened)
			return
		Confirm.#cancelIdx = cancelIdx
		document.body.append(Confirm.#tempElm.content.cloneNode(true))
		const confirm = /**@type {HTMLDialogElement}*/(byId('confirm'))
		Confirm.#buttons?.forEach((btn, i)=> {
			btn.textContent = [btnTxt1,btnTxt2][i]
			btn.onclick = ()=> {$off(NS), Confirm.#remove([fn1,fn2][i])}
		})
		$(confirm).find('.content').text(content).end().fadeIn(300)
		$onNS(NS,{keydown:  Confirm.#onKeydown})
		$onNS(NS,{mousedown:Confirm.#onMousedown})
		confirm.showModal()
		Confirm.#opened = true
	}
	/** @param {?Function} fn */
	#remove(fn) {
		$('#confirm').fadeOut(300,
			function() {
				this.remove()
				fn?.()
				Confirm.#opened = false
			}
		)
	}
};const NS='.CONFIRM'