export const Confirm = freeze(new class {
	#escFn = null;
	get opened()  {return byId('confirm') != null}
	get buttons() {return byId('confirm').querySelector('.buttons')}
	open({content,buttons}) {
		if (Confirm.opened) return;
		$(byId('confirm_temp').content.cloneNode(true)).appendTo('body');
		Object.entries(buttons).forEach(this.#appendButton);
		$('#confirm')
			.on('keydown',  Confirm.#onKeydown)
			.on('mousedown',Confirm.#onMousedown)
			.find('.content').text(content)
			.end().opacity(1, 400)
			.get(0).showModal();
	}
	#appendButton([key, {fn,cancel=false,autoFocus=false}]) {
		const event  = ()=> Confirm.#close(fn);
		const button = $(`<button type=button class=${key}>${key}</button>`)
			.on('click', event)
			.on('keydown', e=> {
				e.key == 'ArrowLeft'  && $(e.target).prev().focus();
				e.key == 'ArrowRight' && $(e.target).next().focus();
			})
			.appendTo(Confirm.buttons);
		cancel && (Confirm.#escFn = event);
		autoFocus && button.focus();
	}
	#onKeydown(e) {
		if (e.key == 'Escape') {
			e.preventDefault()
			Confirm.#escFn?.();
		}
	}
	#onMousedown(e) {
		e.preventDefault();
		e.target == byId('confirm') && Confirm.#escFn?.();
	}
	#close(fn) {
		Confirm.#escFn = null;
		$('#confirm').opacity(0, 400)
			.on('transitionend', e=> {
				e.target.remove();
				isFun(fn) && fn();
			});
	}
});