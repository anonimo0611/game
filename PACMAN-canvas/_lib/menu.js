class Menu {
	get value() {return this.selectedItem.val ?? ''}
	get index() {return +$(this.selectedItem).index()}
	/** @returns {MenuItem} */
	get selectedItem() {return this.menu.querySelector('.selected') || this.lis[0]}
	constructor(id) {
		/** @type {MenuRoot} */
		this.root = byId(this.id=id)
		/** @type {HTMLElement} */
		this.menu = this.root.querySelector('mn-list')
		/** @type {NodeListOf<MenuItem>} */
		this.lis   = this.menu.querySelectorAll('mn-item')
		this.size  = this.lis.length
		this.label = this.root.closest('label')
		this.defaultIndex = this.index
		this.lis.forEach(li=> $(li).css('--data', li.val))
		this.root.closest('form')?.addEventListener('reset',()=> this.reset())
	}
	select(idx=0) {
		if (!this.lis[idx]) return false
		this.selectedItem.classList.remove('selected')
		this.lis[idx].classList.add('selected')
		$(this.menu).trigger('change')
		return true
	}
	/** @param {function} fn */
	bindChange(fn) {isFun(fn) && $(this.menu).on('change', fn)}
	reset() {this.select(this.defaultIndex, {restore:true})}
}
export class DorpDown extends Menu {
	close() {$(this.menu).hide();return this}
	open()  {$(this.menu).show();return this}
	toggle(){$(this.menu).toggle();return this}
	get closed() {return $(this.menu).is(':hidden') == true}
	/** @param {string} id */
	constructor(id) {
		super(id)
		this.cur = this.root.querySelector('output')
		this.lis.forEach((li,i)=> li.onclick = ()=> this.select(i).cur.focus())
		$on('click', e=> !e.target.closest(`#${this.id}`) && this.select())
		$(this.label)
			.on('click', e=> {e.preventDefault();this.cur.focus()})
		$(this.cur)
			.css('width',`${this.menu.offsetWidth}px`)
			.on('click',  ()=> this.toggle())
			.on('keydown',this.#onKeydown.bind(this))
		freeze(this).close().select(this.index)
	}
	#onKeydown(e) {
		const [dir,{size,index}]= [Dir.from(e),this]
		switch (e.key) {
		case 'Tab':
		case 'Escape':
			return this.close()
		case '\x20':
		case 'Enter':
			return this.closed? this.open() : this.select(index)
		case 'ArrowUp':
		case 'ArrowDown':
			this.select((index+Vec2(dir).y+size) % size, {close:false})
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
		super(id)
		const {root,label}=this
		const onWheel  = e=> this.#select(e,e.deltaY > 0 ? L:R)
		const onClick  = e=> this.#select(e,e.target == this.btnL ? L:R)
		const onKeyDwn = e=> this.#select(e,Dir.from(e))
		this.btnR = $('<span class="button r">').prependTo(root).get(0)
		this.btnL = $('<span class="button l">').prependTo(root).get(0)
		this.#setWidth(this.btnL.offsetWidth*2)
		;(label ?? root).addEventListener('wheel',onWheel)
		$(root) .on('keydown',onKeyDwn).find('.button').on('click',onClick)
		$(label).on('click',()=> root.focus())
		freeze(this).select(this.index)
	}
	#select(e, dir) {
		if (!dir) return
		const val = this.index+Vec2({[U]:R,[D]:L}[dir] || dir).x
		between(val, 0, this.size-1) && this.select(val)
		e.type == 'click' && root.focus()
	}
	#setWidth(btnW) {
		this.#width = max(...[...this.lis].map(li=> li.offsetWidth))+btnW
		$(this.lis) .css('width',`${this.#width}px`)
		$(this.root).css('width',`${this.#width}px`)
	}
	select(idx=this.index) {
		if (!super.select(idx)) return
		this.menu.style.transform = `translateX(${-this.#width*idx}px)`
		this.btnL.disabled = (idx == 0)
		this.btnR.disabled = (idx == this.size-1)
	}
}
class MenuRoot extends HTMLElement{get type(){return 'menu'}}
class MenuItem extends HTMLElement{get val() {return this.getAttribute('val')}}
customElements.define('custom-menu', MenuRoot)
customElements.define('mn-item', MenuItem)