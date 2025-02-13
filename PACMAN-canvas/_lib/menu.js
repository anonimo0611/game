import {Vec2} from './vec2.js';
import {Dir,U,R,D,L} from './direction.js'

class Menu {
	reset() {this.select(this.defaultIndex, {restore:true})}
	get index()        {return +$(this.selectedItem).index()}
	get value()        {return String(this.selectedItem.dataset.val) ?? ''}
	get selectedItem() {return this.menu.querySelector('.selected') || this.lis[0]}
	constructor(id) {
		this.root = byId(this.id=id);
		this.menu = this.root.querySelector('menu')
		this.lis  = this.menu.querySelectorAll('li')
		this.size = this.lis.length |0
		this.defaultIndex = this.index
		this.selectedItem.classList.add('selected')
		$(this.root).closest('form').on('reset', ()=> this.reset())
		defineProperty(this.root, 'type', {get(){return 'menu'}})
	}
	bindChange(fn) {
		isFun(fn) && $(this.menu).on('change', fn)
	}
	select(idx=0) {
		if (!this.lis[idx]) return
		this.selectedItem.classList.remove('selected')
		this.lis[idx].classList.add('selected')
		$(this.menu).trigger('change');
	}
}
export class DorpDownMenu extends Menu {
	open()   {$(this.menu).show();  return this}
	close()  {$(this.menu).hide();  return this}
	toggle() {$(this.menu).toggle();return this}
	get closed() {return $(this.menu).is(':hidden') == true}
	/** @param {string} id */
	constructor(id) {
		super(id)
		this.lis.forEach((li, i)=> li.onclick= ()=> {this.select(i),this.current.focus()})
		this.current = this.root.querySelector('.current')
		$(this.current)
		.css('width',`${this.menu.offsetWidth}px`)
		.on('keydown click', e=> {
			if (e.type == 'click')
				return this.toggle()
			const {size,index}=this, dir=Dir.from(e)
			switch (e.key) {
			case 'Tab':
			case 'Escape':
				return this.close()
			case '\x20':
			case 'Enter':
				e.preventDefault()
				return this.closed? this.open() : this.select(index)
			case 'ArrowUp':
			case 'ArrowDown':
				e.preventDefault()
				this.select((index+Vec2(dir).y+size) % size, {close:false})
			}
		})
		$(this.root).prev('label').on('click', ()=> this.current.focus())
		$on('click', e=> {!this.closed && !e.target.closest(`#${id}`) && this.select()})
		freeze(this).close().select(this.index)
	}
	select(idx=this.index, {close=true}={}) {
		super.select(idx)
		$(this.current).attr('data-val', this.value).text(this.selectedItem.textContent)
		close && this.close()
	}
}
export class SlideMenu extends Menu {
	/** @param {string} id */
	constructor(id) {
		super(id)
		const root = this.root
		this.btnR  = $('<button class="r" tabindex=-1>').text('>').prependTo(root).get(0)
		this.btnL  = $('<button class="l" tabindex=-1>').text('<').prependTo(root).get(0)
		$(this.menu).css('display','inline-flex')
		const select = dir=> {
			if (!dir) return
			const val = this.index+Vec2({[U]:R,[D]:L}[dir] || dir).x
			between(val, 0, this.size-1) && this.select(val)
		}
		$(root)
			.prev('.label').on('click', ()=> root.focus())
		$(root)
			.find('button')
			.on('click',  e=> {select(e.target == this.btnL ? L:R);root.focus()})
		$(root)
			.closest('.slidemenu-wrapper')
			.on('wheel',  e=> {select(e.originalEvent.deltaY > 0 ? L:R)})
			.on('keydown',e=> {select(Dir.from(e))})
		this.#setWidth(this.btnL.offsetWidth*2).select(this.index)
		freeze(this)
	}
	#width = 0
	#setWidth(btnW) {
		this.#width = max(...[...this.lis].map(li=> li.offsetWidth)) + btnW
		$(this.lis) .css('width', `${this.#width}px`)
		$(this.root).css('width', `${this.#width}px`)
		return this
	}
	select(idx=this.index) {
		super.select(idx)
		this.menu.style.transform = `translateX(${-this.#width*idx}px)`
		this.btnL.disabled = (idx == 0)
		this.btnR.disabled = (idx == this.size-1)
	}
}