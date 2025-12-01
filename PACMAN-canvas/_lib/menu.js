import {Dir}    from './direction.js'
import {Common} from './common.js'

export class Menu extends Common {
	/** @readonly */root
	/** @readonly */size
	/** @readonly */defaultIndex

	/** @protected */menu
	/** @protected */items
	/** @protected */$label

	/** @protected */
	constructor(
	 /**@type {string}*/id,
	 /**@type {string}*/type
	) {
		const
		root  = /**@type {CustomMenu} */($byId(id).attr({type}) .get(0)),
		menu  = /**@type {HTMLElement}*/($(root).find('mn-list').get(0)),
		items = /**@type {MenuItem[]} */($(menu).find('mn-item').get())
		if (!root || !menu || !items.length) {
			throw Error('The menu structure is invalid')
		}
		super({eventTarget:menu})
		this.root   = root
		this.size   = items.length
		this.menu   = menu
		this.items  = items
		this.reset  = this.reset.bind(this)
		this.$label = $(root).closest('label')
		this.defaultIndex = this.index

		items.forEach(i=> $(i).css('--val', i.val))
		$(this.root).closest('form').on({reset:this.reset})
	}
	get value()  {return this.selectedItem.val}
	get index()  {return this.selectedItem.index}
	set index(i) {this.select(i)}

	/** @returns {MenuItem} */
	get selectedItem() {
		return this.menu.querySelector('.selected') || this.items[0]
	}
	/** @protected @param {number} idx */
	isInRange(idx) {return between(idx, 0, this.size-1)}

	select(idx=0) {
		if (!this.isInRange(idx)) return
		this.selectedItem.classList.remove('selected')
		this.items[idx].classList.add('selected')
		$(this.menu).trigger('change');
	}
	reset() {this.select(this.defaultIndex)}
}

export class DorpDown extends Menu {
	constructor(/**@type {string}*/id) {
		super(id,'dropdown')
		/** @private */
		this.current = $('<output>').prependTo(this.root)[0]
		this.items.forEach((li,i)=> {
			li.onclick = ()=> this.select(i)
			this.current.focus()
		})
		$('body')
			.on('pointerdown', e=> {
				!e.target.closest(`#${this.root.id}`)
				  && this.select()
			})
		$(this.$label)
			.on('pointerdown', e=> {
				e.preventDefault()
				this.current.focus()
			})
		$(this.current)
			.on('keydown', e=> this.#onKeydown(e))
			.on('pointerdown', ()=> this.toggle())
			.css('width',`${this.menu.offsetWidth}px`)

		this.close()
		this.current.tabIndex = 0
		this.select(this.index)
	}
	close()  {$(this.menu).hide()}
	open()   {$(this.menu).show()}
	toggle() {$(this.menu).toggle()}

	get closed() {
		return $(this.menu).is(':hidden')
	}
	#onKeydown(/**@type {JQuery.KeyDownEvent}*/e) {
		const {size,index:i}= this
		match(e.key, {
			'Tab|Escape': ()=> {
				this.close()
			},
			'Enter|\x20': ()=> {
				this.closed
				? this.open()
				: this.select(i)
			},
			'ArrowUp|ArrowDown': ()=> {
				const dir = /Up$/.test(e.key) ? -1:1
				this.select((i+dir+size) % size, {close:false})
			}
		})
	}
	select(idx=this.index, {close=true}={}) {
		super.select(idx)
		const {val,innerText}= this.selectedItem
		$(this.current).css('--val',val).text(innerText)
		close && this.close()
	}
}

export class Slide extends Menu {
	/** @private */width
	/** @private */BtnSet
	constructor(/**@type {string}*/id) {
		super(id,'slidemenu')
		const{root}= this, wrap=(this.$label.get(0) ?? root)
		this.BtnSet= freeze({
			[R]: $('<span class="button r">').prependTo(root)[0],
			[L]: $('<span class="button l">').prependTo(root)[0],
		})
		$(this.BtnSet[L]).on('click',()=> {this.#select(L)})
		$(this.BtnSet[R]).on('click',()=> {this.#select(R)})
		$(root).on('keydown',e=>{this.#select(Dir.from(e))})
		$(wrap).on('wheel',  e=>{this.#select(wheelDeltaY(e)>0 ? L:R)})
		$(wrap).on('pointerdown', e=>{e.preventDefault(),root.focus()})
		root.tabIndex = 0
		this.width = this.#setWidth(this.BtnSet[L].offsetWidth*2)
		this.select(this.index)
	}
	#select(/**@type {?Direction}*/dir) {
		if (!dir) return
		const v = Vec2[dir]
		this.index += (v.x || -v.y)
	}
	#setWidth(/**@type {number}*/btnW) {
		const width = max(...[...this.items].map(li=> li.offsetWidth))+btnW
		$(this.root) .css('width',`${width}px`)
		$(this.items).css('width',`${width}px`)
		return width
	}
	select(idx=this.index) {
		if (!this.isInRange(idx)) return
		super.select(idx)
		this.menu.style.transform = `translateX(${-this.width*idx}px)`
		this.BtnSet[L].dataset.disabled = String(idx == 0)
		this.BtnSet[R].dataset.disabled = String(idx == this.size-1)
	}
}

class CustomMenu extends HTMLElement{
	get type() {return 'menu'}
}
class MenuItem extends HTMLElement{
	get val()   {return $(this).attr('val') ?? ''}
	get index() {return $(this).index()}
}
customElements.define('custom-menu', CustomMenu)
customElements.define('mn-item', MenuItem)