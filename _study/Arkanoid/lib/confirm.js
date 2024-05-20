let escFn = null;
export const Confirm = freeze(new class {
	get opened(){return byId('confirm') != null}
	get #btns() {return byId('confirm').qs('.buttons')}
	#getBtn(key){return byId('confirm').qs(`button.${key}`)}
	open({content,cancelId,autoFocusId,funcCfg}) {
		if (Confirm.opened) return;
		byId('confirm_temp').appendTo(document.body);
		const
			confirm = byId('confirm');
			confirm.showModal();
		for (const [key,fn] of entries(funcCfg)) {
			const btn  = makeElm('button[type=button]').text(key).appendTo(Confirm.#btns);
			btn.className = key;
			btn.onclick   = _=> {this.#close(fn),$off(NS)};
			btn.onkeydown = e=> {
				e.key == 'ArrowLeft'  && $(btn).prev().focus();
				e.key == 'ArrowRight' && $(btn).next().focus();
			};
		}
		this.#getBtn(autoFocusId)?.focus();
		escFn = this.#getBtn(cancelId)?.onclick || null;
		$(confirm).on(`keydown${NS}`,  Confirm.#onKeydown);
		$(confirm).on(`mousedown${NS}`,Confirm.#onMousedown);
		$('#confirm').find('.content').text(content).end().opacity(1, 400);
	}
	#onKeydown(e) {
		e.key == 'Escape' && (e.preventDefault(), escFn?.());
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