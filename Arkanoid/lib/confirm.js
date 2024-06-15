
let escFn = null;
export const Confirm = freeze(new class {
	get opened() {return byId('confirm') != null}
	get #btns()  {return byId('confirm').querySelector('.buttons')}
	#getBtn(key) {return byId('confirm').querySelector(`button.${key}`)}
	open({content,cancelId,autoFocusId,funcCfg}) {
		if (Confirm.opened) return;
		$(byId('confirm_temp').content.cloneNode(true)).appendTo(dBody);
		const
			confirm = byId('confirm');
			confirm.showModal();
		for (const [key,fn] of entries(funcCfg)) {
			const btn  = $('<button type=button></button>')
				.text(key).appendTo(Confirm.#btns).get(0);
			btn.className = key;
			btn.onclick = ()=> {
				this.#close(fn), $off(NS)
			};
			btn.onkeydown = e=> {
				e.key == 'ArrowLeft'  && $(btn).prev().focus();
				e.key == 'ArrowRight' && $(btn).next().focus();
			};
		}
		this.#getBtn(autoFocusId)?.focus();
		escFn = this.#getBtn(cancelId)?.onclick || null;
		$(confirm).on(`keydown${NS}`,   Confirm.#onKeydown);
		$(confirm).on(`mousedown${NS}`, Confirm.#onMousedown);
		$('#confirm').find('.content').text(content).end().opacity(1, 400);
	}
	#onKeydown(e) {
		if (e.key == 'Escape') {
			e.preventDefault()
			escFn?.();
		}
	}
	#onMousedown(e) {
		e.preventDefault();
		e.target == byId('confirm') && escFn?.();
	}
	#close(fn) {
		escFn = null;
		$('#confirm').opacity(0, 400).on('transitionend',
			e=> {e.target.remove();isFun(fn) && fn()});
	}
}); const NS='.CONFIRM';