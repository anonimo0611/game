import {Dir,L,R} from './direction.js'
export const Confirm = new class ConfirmCore {
	#opened = false
	get opened() {return this.#opened}

	/** @param {JQKeyboardEvent} e */
	#onKeydown = e=> {
		const btns = $('#confirm button').get()
		if (e.key == 'Escape') {
			e.preventDefault()
			return $(btns).filter('.cancel')[0]?.click()
		}
		if (e.target instanceof HTMLButtonElement) {
			e.preventDefault()
			const i = $(e.target).index()
			Dir.from(e) == [R,L][i] && btns[1^i]?.focus()
		}
	}
	#appendDialog() {
		const temp = requireElem('confirm_t',HTMLTemplateElement)
		document.body.append(temp.content.cloneNode(true))
		return requireElem('confirm',HTMLDialogElement)
	}

	/**
	 @param {string} content   Dialog description
	 @param {?()=> void} cb1   Functions to assign to the left button
	 @param {?()=> void} cb2   Functions to assign to the right button
	 @param {string} [btn1Txt] Text of the left  button
	 @param {string} [btn2Txt] Text of the right button
	 @param {0|1} [cancelIdx]  Button to assign when canceling; 0=left(default), 1=right
	 @param {0|1} [autoFocus]  0=left, 1=right; The default is the same as `cancelIdx`
	*/
	open(content, cb1,cb2, btn1Txt='Cancel', btn2Txt='Ok', cancelIdx=0, autoFocus=cancelIdx) {
		if (this.opened) return
		this.#opened  = true
		const eDialog = this.#appendDialog()
		const $Dialog = $(eDialog)
		$Dialog.find('.content').text(content)
		$Dialog.find('button').each((i,btn)=> {
			if (i == autoFocus) btn.autofocus = true
			btn.classList.add(i == cancelIdx? 'cancel':'ok')
			btn.textContent = [btn1Txt,btn2Txt][i]
			btn.onclick = ()=> {
				$win.off(NS)
				$Dialog.fadeOut(300, ()=> {
					eDialog.close()
					eDialog.remove()
					this.#opened = false
					;[cb1,cb2][i]?.()
				})
			}
		})
		eDialog.showModal()
		$Dialog.fadeIn(300)
		$win.onNS(NS,{keydown:this.#onKeydown})
		$win.onNS(NS,{pointerdown:e=> e.preventDefault()})
	}
}, NS = '.CONFIRM'