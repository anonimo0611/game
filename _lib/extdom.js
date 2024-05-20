import {Dir} from './direction.js'
const [_x,_y,_trX,_trY,_rotate,_scale]= integers(6).map(_=>Symbol())
Object.defineProperties(HTMLDivElement.prototype, {
	width: {get(){return this.offsetWidth }},
	height:{get(){return this.offsetHeight}},
})
Object.defineProperties(HTMLElement.prototype, {
	top:   {get(){return this.offsetTop }},
	left:  {get(){return this.offsetLeft}},
	x:     {get(){return this[_x]   || 0}},
	y:     {get(){return this[_y]   || 0}},
	trX:   {get(){return this[_trX] || 0}},
	trY:   {get(){return this[_trY] || 0}},
	scale: {get(){return this[_scale]  ?? 1}},
	rotate:{get(){return this[_rotate] || 0}},
	pos: {
		get() {return {x:this.x, y:this.y}},
		set(v){this.setPos(v ?? {})}
	},
	trPos: {
		get() {return {x:this.trX, y:this.trY}},
		set(v){this.setTrPos(v ?? {})}
	},
	ctPos: {
		get() {return {
			x:this.trX - this.left,
			y:this.trY - this.top}
		}
	},
})
Object.assign(HTMLElement.prototype, {
	qs(selector) {
		return this.querySelector(selector)
	},
	find(selector){
		return this.querySelectorAll(selector)
	},
	prop(arg, readOnly) {
		if (!isObj(arg)) return this
		for (const [key, value] of entries(arg))
			!readOnly
				? this[key]=value
				: Object.defineProperty(this, key,
					{value, writable:false, configurable:true})
		return this
	},
	readOnly(arg) {
		return this.prop(arg, true)
	},
	text(text) {
		return !arguments.length
			?  this.textContent
			: (this.textContent=text, this)
	},
	attr(name, value) {
		return arguments.length == 1
			?  this.getAttribute(name)
			: (this.setAttribute(name, value), this)
	},
	data(arg) {
		if (isStr(arg)) return this.dataset[arg]
		keys(arg).forEach(key=> this.dataset[key] = arg[key])
		return this
	},
	removeAttr(...names) {
		names.forEach(name=> this.removeAttribute(name))
		return this
	},
	hasClass(name) {
		return this.classList.contains(name)
	},
	addClass(...names) {
		this.classList.add(...names)
		return this
	},
	removeClass(...names) {
		this.classList.remove(...names)
		return this
	},
	replaceClass(...args) {
		this.classList.replace(...args)
		return this		
	},
	toggleClass(...args) {
		this.classList.toggle(...args)
		return this
	},
	appendTo(arg) {
		if (isStr(arg) && dqs(arg)) arg = dqs(arg)
		return isElm(arg) && arg.append(typeOf(this) == 'HTMLTemplateElement'
			? this.content.cloneNode(true) : this) || this
	},
	prependTo(arg) {
		if (isStr(arg) && dqs(arg)) arg = dqs(arg)
		return isElm(arg) && arg.prepend(typeOf(this) == 'HTMLTemplateElement'
			? this.content.cloneNode(true) : this) || this
	},
	fontSize(num) {
		return !arguments.length
			? parseFloat(this.css('font-size'))
			: isNum(num)? this.css('font-size',`${num}px`) : this
	},
	opacity(arg=null, fade=-1) {
		if (!arguments.length) return +this.css('opacity')
		if (arg === null) return this.css('opacity','')
		this.style.transition = +fade > 0 ? `opacity ${fade}ms` : null
		return isNum(+arg)? this.css('opacity', clamp(+arg, 0, 1)) : this
	},
	css(prop, val, priority) {
		return arguments.length == 1
			? (this.style.getPropertyValue(prop) || getComputedStyle(this)[prop])
			: (this.style.setProperty(prop, val, priority? 'important' : ''), this)
	},
	moveByDir(dir, step, orient) {
		if (!Dir.isValid(dir) || !step) return this
		const v   = Dir.toVec2(dir, step, this.trPos)
		const rot = orient && Dir.angle(orient === true ? dir : orient) || 0
		return this.transform(v.x, v.y, rot)
	},
	transform(...args) {
		const {trX,trY,rotate,scale}= this
		if (!args.length) return {x:trX,y:trY,rotate,scale}
		let [x,y,r,s]= args
		isObj(args[0]) && ({x,y,rotate:r,scale:s}=args[0])
		x = this[_trX]    = isNum(x)? round(x*1e3)/1e3 : trX
		y = this[_trY]    = isNum(y)? round(y*1e3)/1e3 : trY
		s = this[_scale]  = isNum(s)? s : scale
		r = this[_rotate] = isNum(r)? r : rotate
		this.style.transform = `translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`
		return this
	},
	setPos({x, y}={}) {
		isNum(x) && (this[_x] = x|0)
		isNum(y) && (this[_y] = y|0)
		return this
	},
	setTrPos({x, y}={}) {
		isNum(x) && (this[_trX] = x)
		isNum(y) && (this[_trY] = y)
		return this
	},
	circleCollision({x, y}={}, r1, r2) {
		return this.hidden? false : (this.trX-x)**2 + (this.trY-y)**2 <= (r1+(r2 ?? r1))**2
	},
})