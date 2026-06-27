import {Dir,L,R} from './direction.js'
export const Confirm = new class ConfirmCore {
	#opened = false
	get opened() {return this.#opened}

	/** @param {JQKeyboardEvent} e */
	#onKeydown = e=> {
		const btns = $('#confirm button').get()
		if (e.key == 'Escape') {
			e.preventDefault()
			return $(btns).filter('.cancel')[0].click()
		}
		if (e.target instanceof HTMLButtonElement) {
			const i = $(e.target).index()
			Dir.from(e) == [R,L][i] && btns[1^i]?.focus()
		}
	}
	#appendDialog() {
		const temp = reqElem('#confirm_t',HTMLTemplateElement)
		document.body.append(temp.content.cloneNode(true))
		return $(reqElem('#confirm',HTMLDialogElement))
	}

	/**
	 @typedef {[label:string, cb?:()=> void]} Button
	 @param {string} content  - Dialog description
	 @param {Button} ButtonL  - [label: string, cb?: ()=> void]
	 @param {Button} ButtonR  - [label: string, cb?: ()=> void]
	 @param {0|1} [cancelIdx] - Button to assign when canceling; 0=left(default), 1=right
	 @param {0|1} [autoFocus] - 0=left, 1=right; The default is the same as `cancelIdx`
	*/
	open(content, ButtonL, ButtonR, cancelIdx=0, autoFocus=cancelIdx) {
		if (this.opened) return
		this.#opened = true
		const
		$dialog = this.#appendDialog()
		$dialog.find('.content').text(content)
		$dialog.find('button').each((i,btn)=> {
			if (i == autoFocus) btn.autofocus = true
			btn.classList.add(i == cancelIdx? 'cancel':'ok')
			btn.textContent = [ButtonL,ButtonR][i][0]
			btn.onclick = ()=> {
				$dialog.fadeOut(300, function() {
					this.close()
					this.remove()
					;[ButtonL,ButtonR][i][1]?.()
					Confirm.#opened = false
				})
			}
		})
		$dialog.on({
			keydown:this.#onKeydown,
			pointerdown:e=> e.preventDefault()
		}).fadeIn(300)[0].showModal()
	}
}