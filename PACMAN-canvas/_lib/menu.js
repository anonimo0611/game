import {Common} from './common.js'
class Menu extends Common {
	get value() {return this.selectedItem.val ?? ''}
	get index() {return +$(this.selectedItem).index()}

	/** @returns {MenuItem} */
	get selectedItem() {
		return this.menu.querySelector('.selected') || this.items[0]
	}
	constructor(id, type) {

		/** @type {MenuRoot} */
		const root = $byId(id).attr({type}).get(0)

		/** @type {HTMLElement} */
		const menu = root.querySelector('mn-list')

		/** @type {NodeListOf<MenuItem>} */
		const items = menu.querySelectorAll('mn-item')

		super({eventTarget:menu})
		this.id    = id
		this.root  = root
		this.menu  = menu
		this.items = items
		this.size  = items.length
		this.label = root.closest('label')
		this.reset = this.reset.bind(this)
		this.defaultIndex = this.index

		for (const i of this.items) $(i).css('--data', i.val)
		$(this.root).closest('form').on('reset', this.reset)
	}
	select(idx=0) {
		if (!this.items[idx]) return false
		this.selectedItem.classList.remove('selected')
		this.items[idx].classList.add('selected')
		this.trigger('change')
		return true
	}
	reset() {this.select(this.defaultIndex)}
}

export class DorpDown extends Menu {
	close() {$(this.menu).hide();  return this}
	open()  {$(this.menu).show();  return this}
	toggle(){$(this.menu).toggle();return this}
	get closed() {
		return $(this.menu).is(':hidden') == true
	}
	/** @param {string} id */
	constructor(id) {
		super(id,'dropdown')
		this.cur = this.root.querySelector('output')
		this.items.forEach((li,i)=> li.onclick = ()=> this.select(i).cur.focus())
		$on('pointerdown', e=> !e.target.closest(`#${this.id}`) && this.select())
		$(this.label)
			.on('pointerdown', e=> {e.preventDefault();this.cur.focus()})
		$(this.cur)
			.css('width',`${this.menu.offsetWidth}px`)
			.on('pointerdown', ()=> this.toggle())
			.on('keydown',this.#onKeydown.bind(this))
		this.close()
		this.select(this.index)
		freeze(this)
	}
	/** @param {KeyboardEvent} e */
	#onKeydown(e) {
		const [dir,{size,index}]= [Dir.from(e),this]
		switch (e.key) {
		case 'Tab':
		case 'Escape':
			this.close()
			return
		case '\x20':
		case 'Enter':
			this.closed
				? this.open()
				: this.select(index)
			return
		case 'ArrowUp':
		case 'ArrowDown':
			this.select((index+Vec2[dir].y+size) % size, {close:false})
		}
	}
	select(idx=this.index, {close=true}={}) {
		if (!super.select(idx)) return this
		const {selectedItem:item}= this
		$(this.cur).css('--data', item.val).text(item.textContent)
		return close && this.close() || this
	}
}

export class Slide extends Menu {
	#width = 0

	/** @param {string} id */
	constructor(id) {
		super(id,'slidemenu')
		const {root,label}=this
		const onWheel  = e=> this.#select(e, e.deltaY > 0 ? L:R)
		const onClick  = e=> this.#select(e, e.target == this.btn.L ? L:R)
		const onKeyDwn = e=> this.#select(e, Dir.from(e))

		/** @type {{R:HTMLElement,L:HTMLElement}} */
		this.btn = freeze({
			R: $('<span class="button r">').prependTo(root).get(0),
			L: $('<span class="button l">').prependTo(root).get(0),
		})
		this.#setWidth(this.btn.L.offsetWidth*2)
		;(label ?? root).addEventListener('wheel',onWheel)
		$(root) .on('keydown',onKeyDwn).find('.button').on('click',onClick)
		$(label).on('pointerdown', e=> {e.preventDefault();root.focus()})
		freeze(this).select(this.index)
	}
	/**
	 * @param {Event} e
	 * @param {Direction} dir */
	#select(e, dir) {
		if (dir) {
			dir = {[U]:R,[D]:L}[dir] || dir
			const val = this.index+Vec2[dir].x
			between(val, 0, this.size-1) && this.select(val)
			e.type == 'click' && this.root.focus()
		}
	}
	/** @param {number} btnW */
	#setWidth(btnW) {
		this.#width = max(...[...this.items].map(li=> li.offsetWidth))+btnW
		$(this.root) .css('width',`${this.#width}px`)
		$(this.items).css('width',`${this.#width}px`)
	}
	select(idx=this.index) {
		if (!super.select(idx)) return
		this.menu.style.transform = `translateX(${-this.#width*idx}px)`
		this.btn.L.dataset.disabled = (idx == 0)
		this.btn.R.dataset.disabled = (idx == this.size-1)
	}
}
class MenuRoot extends HTMLElement{get type() {return 'menu'}}
class MenuItem extends HTMLElement{get val()  {return this.getAttribute('val')}}
customElements.define('custom-menu', MenuRoot)
customElements.define('mn-item', MenuItem)