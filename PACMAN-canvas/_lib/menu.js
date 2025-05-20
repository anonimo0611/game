import {Dir}    from './direction.js'
import {Common} from './common.js'

class Menu extends Common {
	get value() {return this.selectedItem.val}
	get index() {return $(this.selectedItem).index()}

	/** @returns {MenuItem} */
	get selectedItem() {
		return this.menu?.querySelector('.selected') || this.items[0]
	}
	/**
	 * @protected
	 * @param {string} id
	 * @param {string} type
	 */
	constructor(id, type) {
		const root  = /**@type {MenuRoot}*/   ($byId(id).attr({type}) .get(0))
		const menu  = /**@type {HTMLElement}*/($(root).find('mn-list').get(0))
		const items = /**@type {MenuItem[]} */($(menu).find('mn-item').get())

		if (!root || !menu || !items.length)
			throw ReferenceError('The Menu structure of the document is incorrect')

		super({eventTarget:menu})
		this.id     = id
		this.root   = root
		this.menu   = menu
		this.items  = items
		this.size   = items.length
		this.reset  = this.reset.bind(this)
		this.$label = $(root).closest('label')
		this.defaultIndex = this.index

		for (const i of this.items) $(i).css('--val', i.val)
		$(this.root).closest('form').on('reset', this.reset)
	}
	select(idx=0) {
		this.selectedItem.classList.remove('selected')
		this.items[idx].classList.add('selected')
		this.trigger('change')
	}
	reset() {this.select(this.defaultIndex)}
}

export class DorpDown extends Menu {
	close()  {$(this.menu).hide();  return this}
	open()   {$(this.menu).show();  return this}
	toggle() {$(this.menu).toggle();return this}
	get closed() {
		return $(this.menu).is(':hidden') == true
	}
	/** @param {string} id */
	constructor(id) {
		super(id,'dropdown')
		this.$cur = $(this.root).find('output')
		this.items.forEach((li,i)=> li.onclick = ()=> this.select(i).$cur.focus())
		$('body')
			.on('pointerdown', e=> {!e.target.closest(`#${this.id}`) && this.select()})
		$(this.$label)
			.on('pointerdown', e=> {e.preventDefault(),this.$cur.focus()})
		$(this.$cur)
			.css('width',`${this.menu.offsetWidth}px`)
			.on('pointerdown', ()=> this.toggle())
			.on('keydown', this.#onKeydown.bind(this))
		this.close()
		this.select(this.index)
		freeze(this)
	}
	/** @param {KeyboardEvent} e */
	#onKeydown(e) {
		const {size,index}= this
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
		case 'ArrowDown': {
				const dir = e.key.endsWith('Up') ? -1:1
				this.select((index+dir+size) % size, {close:false})
			}
		}
	}
	select(idx=this.index, {close=true}={}) {
		super.select(idx)
		const item = this.selectedItem
		this.$cur.css('--val', item.val).text(item.innerText)
		return close && this.close() || this
	}
}

export class Slide extends Menu {
	#width = 0
	/** @param {string} id */
	constructor(id) {
		super(id,'slidemenu')
		const {root}= this,
		wrap = /**@type {HTMLElement}*/(this.$label.get(0) ?? root)
		this.btnR = $('<span class="button r">').prependTo(root)[0]
		this.btnL = $('<span class="button l">').prependTo(root)[0]
		this.#setWidth(this.btnL.offsetWidth*2)
		$(root).on('keydown',    e=> {this.#select(Dir.from(e))})
		$(wrap).on('wheel',      e=> {this.#select(wheelDeltaY(e)>0?L:R)})
		$(wrap).on('pointerdown',e=> {e.preventDefault(),root.focus()})
		for (const btn of [this.btnL,this.btnR])
			$(btn).on('click', e=> {this.#select(e.target==this.btnL?L:R)})
		freeze(this).select(this.index)
	}
	/** @param {?Direction} dir */
	#select(dir) {
		dir = {Up:U,Down:L}[dir] || dir
		if (dir) {
			const val = this.index+Vec2[dir].x
			between(val, 0, this.size-1) && this.select(val)
		}
	}
	/** @param {number} btnW */
	#setWidth(btnW) {
		this.#width = max(...[...this.items].map(li=> li.offsetWidth))+btnW
		$(this.root) .css('width',`${this.#width}px`)
		$(this.items).css('width',`${this.#width}px`)
	}
	select(idx=this.index) {
		super.select(idx)
		this.menu.style.transform  =`translateX(${-this.#width*idx}px)`
		this.btnL.dataset.disabled = String(idx == 0)
		this.btnR.dataset.disabled = String(idx == this.size-1)
	}
}

class MenuRoot extends HTMLElement{get type() {return 'menu'}}
class MenuItem extends HTMLElement{get val()  {return $(this).attr('val') ?? ''}}
customElements.define('custom-menu', MenuRoot)
customElements.define('mn-item', MenuItem)
