import {Dir,U,R,D,L} from './direction.js'
class Menu {
	constructor(id) {
		this.root = byId(this.id=id).readOnly({type:'menu'})
		this.menu = this.root.qs('menu')
		this.lis  = this.menu.find('li')
		this.size = this.lis.length |0
		this.defaultIndex = this.index
		this.root.closest('form')?.on('reset', _=> this.reset())
		this.selectedItem.addClass('selected')
		$on('Start', _=> this.#onStart());
		$on('Reset', _=> this.#onReset());
	}
	#onStart() {
		this.root.parentNode.style.visibility = 'hidden';
	}
	#onReset() {
		this.root.parentNode.style.visibility = 'visible';
	}
	get selectedItem() {
		return this.menu.qs('li.selected') || this.lis[0]
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
		this.selectedItem.removeClass('selected')
		this.lis[idx].addClass('selected')
	}
}
export class DorpDownMenu extends Menu {
	open()   {$(this.menu).show()}
	close()  {$(this.menu).hide()}
	toggle() {$(this.menu).toggle()}
	get closed() {return $(this.menu).is(':hidden') == true}
	constructor(id, idx) {
		super(id)
		this.lis.forEach((li, i)=> li.onclick=()=> {this.select(i),this.current.focus()})
		this.current = this.root.qs('.current').css('width',`${this.menu.offsetWidth}px`)
		this.current.on('keydown click', e=> {
			if (e.type == 'click') return this.toggle()
			const {size,index}=this, dir=Dir.from(e.key)
			switch (e.key) {
			case 'Tab':
			case 'Escape':
				return this.close()
			case '\x20':
			case 'Enter': 
				return this.closed ? this.open() : this.select(index)
			case 'ArrowUp':
			case 'ArrowDown':
				this.select((index+Vec2[dir].y+size) % size, {close:false})
			}
		})
		$(this.root).prev('label').on('click', ()=> this.current.focus())
		$on('click', e=> {!this.closed && !e.target.closest(`#${id}`) && this.select()})
		freeze(this).close()
		if (isNum(idx)) this.select(idx, {restore:true});
	}
	select(idx=this.index, {restore=false,close=true}={}) {
		super.select(idx)
		this.current.attr('data-val', this.value).text(this.selectedItem.text())
		close && this.close()
	}
}
export class SlideMenu extends Menu {
	constructor(id, idx) {
		super(id)
		const root = this.root
		this.btnR  = makeElm('button.r[tabindex=-1]').text('>').prependTo(root)
		this.btnL  = makeElm('button.l[tabindex=-1]').text('<').prependTo(root)
		this.menu.css('display','inline-flex')
		const select = dir=> {
			if (!dir) return
			const val = this.index+Vec2[{[U]:R,[D]:L}[dir] || dir].x
			this.select((val+this.size) % this.size);
			//between(val, 0, this.size-1) && this.select(val)
		}
		$(root).find('button')
			.on('click',  e=> {select(e.target == this.btnL ? L:R);root.focus()})
		$(root).closest('.slidemenu-wrapper')
			.on('wheel',  e=> {select(e.originalEvent.deltaY > 0 ? L:R)})
			.on('keydown',e=> {select(Dir.from(e.key))})
		$(root).prev('label').on('click', _=> root.focus())
		freeze(this).#setWidth(this.btnL.offsetWidth*2)
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
		this.menu.style.transform = `translateX(${-this.#width*idx}px)`
		//this.btnL.disabled = (idx == 0)
		//this.btnR.disabled = (idx == this.size-1)
	}
}