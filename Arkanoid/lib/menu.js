import {Vec2} from './vec2.js'
import {Dir,U,R,D,L} from './direction.js'
class Menu {
	constructor(id) {
		this.root = byId(this.id=id)
		this.menu = this.root.querySelector('menu')
		this.lis  = this.menu.querySelectorAll('li')
		this.size = this.lis.length
		this.defaultIndex = this.index
		$(this.root).closest('form').on('reset', _=> this.reset())
		$(this.selectedItem).addClass('selected')
		$on('Start', _=> this.#onStart())
		$on('Reset', _=> this.#onReset())
	}
	#onStart() {
		this.root.parentNode.style.visibility = 'hidden'
	}
	#onReset() {
		this.root.parentNode.style.visibility = 'visible'
	}
	get selectedItem() {
		return this.menu.querySelector('li.selected') || this.lis[0]
	}
	get index() {
		return $(this.selectedItem).index() |0
	}
	get value() {
		const val = (this.selectedItem.dataset.val || '')
		return toNumber(val, val)
	}
	reset() {
		this.select(this.defaultIndex, {restore:true})
	}
	select(idx=0) {
		if (!this.lis[idx]) return
		$(this.selectedItem).removeClass('selected')
		$(this.lis[idx]).addClass('selected')
	}
}
export class SlideMenu extends Menu {
	constructor(id, idx) {
		super(id)
		const root = this.root
		this.btnR = $('<button class=r tabindex="-1">&gt;</button>').prependTo(root).get(0)
		this.btnL = $('<button class=l tabindex="-1">&lt;</button>').prependTo(root).get(0)
		$(this.menu).css({display:'inline-flex'})
		const select = dir=> {
			if (!dir) return
			const val = this.index+Vec2[{[U]:R,[D]:L}[dir] || dir].x
			this.select((val+this.size) % this.size);
		}
		$(root)
			.find('button')
			.on('click',  e=> {select(e.target == this.btnL ? L:R);root.focus()})
		$(root)
			.closest('.slidemenu-wrapper')
			.on('wheel',  e=> {select(e.originalEvent.deltaY > 0 ? L:R)})
			.on('keydown',e=> {select(Dir.from(e.key))})
		$(root)
			.prev('label')
			.on('click', _=> root.focus())

		this.#setWidth(this.btnL.offsetWidth*2)
			.select(idx ?? this.index, {restore:true})
	}
	#width = 0
	#setWidth(btnW) {
		this.#width = max(...[...this.lis].map(li=> li.offsetWidth)) + btnW
		$(this.lis) .css('min-width', `${this.#width}px`)
		$(this.root).css('min-width', `${this.#width}px`)
		return this
	}
	select(idx,{restore=false}={}) {
		super.select(idx)
		this.menu.style.transform = `translateX(${-this.#width * idx}px)`
	}
}