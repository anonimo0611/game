import {Dir}    from './direction.js'
import {Common} from './common.js'

export class Menu extends Common {
	get value()  {return this.selectedItem.val}
	get index()  {return $(this.selectedItem).index()}
	set index(i) {(i>=0 && i<this.size) && this.select(i)}

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
		const root  = /**@type {CustomMenu} */($byId(id).attr({type}) .get(0))
		const menu  = /**@type {HTMLElement}*/($(root).find('mn-list').get(0))
		const items = /**@type {MenuItem[]} */($(menu).find('mn-item').get())

		if (!root || !menu || !items.length) {
			throw ReferenceError('The menu structure is invalid')
		}
		super({eventTarget:menu})
		this.root  = root
		this.$root = $(root)
		this.menu  = menu
		this.items = items
		this.id    = id
		this.size  = items.length
		this.reset = this.reset.bind(this)
		this.defaultIndex = this.index

		/** @protected */
		this.$label = $(root).closest('label')

		items.forEach(i=> $(i).css('--val', i.val))
		$(this.root).closest('form').on('reset', this.reset)
	}
	select(idx=0) {
		if (!between(idx, 0, this.size-1))
			throw ReferenceError('List index out of range')
		this.selectedItem.classList.remove('selected')
		this.items[idx].classList.add('selected')
		return this.trigger('change')
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
		this.cur = $(document.createElement('output')).prependTo(this.root)[0]
		this.items.forEach((li,i)=> li.onclick = ()=> this.select(i).cur.focus())
		$('body')
			.on('pointerdown', e=> {!e.target.closest(`#${this.id}`) && this.select()})
		$(this.$label)
			.on('pointerdown', e=> {e.preventDefault(),this.cur.focus()})
		$(this.cur)
			.css('width',`${this.menu.offsetWidth}px`)
			.on('pointerdown', ()=> this.toggle())
			.on('keydown', e=> this.#onKeydown(e))
		this.close()
		this.cur.tabIndex = 0
		this.select(this.index)
		freeze(this)
	}
	/** @param {JQuery.KeyDownEvent} e */
	#onKeydown(e) {
		const {size,index:i}= this
		match(e.key, {
			'Tab_Escape': ()=> {this.close()},
			'Enter_\x20': ()=> {this.closed? this.open() : this.select(i)},
			'ArrowUp_ArrowDown': ()=> {
				const dir = /Up$/.test(e.key) ? -1:1
				this.select((i+dir+size) % size, {close:false})
			}
		})
	}
	select(idx=this.index, {close=true}={}) {
		super.select(idx)
		const item = this.selectedItem
		$(this.cur).css('--val', item.val).text(item.innerText)
		return (close && this.close()) || this
	}
}

export class Slide extends Menu {
	#width = 0
	/** @param {string} id */
	constructor(id) {
		super(id,'slidemenu')
		const {root}= this, wrap = this.$label.get(0) ?? root
		this.btnR = $('<span class="button r">').prependTo(root)[0]
		this.btnL = $('<span class="button l">').prependTo(root)[0]
		this.#setWidth(this.btnL.offsetWidth*2)
		$(root).on('keydown',    e=> {this.#select(Dir.from(e))})
		$(wrap).on('wheel',      e=> {this.#select(wheelDeltaY(e)>0 ? L:R)})
		$(wrap).on('pointerdown',e=> {e.preventDefault(),root.focus()})
		for (const [i,btn] of [this.btnL,this.btnR].entries())
			$(btn).on('click', ()=> {this.#select(i? R:L)})
		root.tabIndex = 0
		this.select(this.index)
		freeze(this)
	}
	/** @param {?Direction} dir */
	#select(dir) {
		if (dir) {
			const v = Vec2[dir]
			this.index += (v.x || -v.y)
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
		return this
	}
}

class CustomMenu extends HTMLElement{
	get type() {return 'menu'}
}
class MenuItem extends HTMLElement{
	get val()  {return $(this).attr('val') ?? ''}
}
customElements.define('custom-menu', CustomMenu)
customElements.define('mn-item', MenuItem)