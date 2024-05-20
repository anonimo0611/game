Object.defineProperties(HTMLDivElement.prototype, {
	width: {get(){return this.offsetWidth }},
	height:{get(){return this.offsetHeight}},
})
Object.defineProperties(HTMLElement.prototype, {
	top: {get(){return this.offsetTop }},
	left:{get(){return this.offsetLeft}},
})
Object.assign(HTMLElement.prototype, {
	qs(selector)  {
		return this.querySelector(selector)
	},
	find(selector){
		return this.querySelectorAll(selector)
	},
	prop(arg, readOnly) {
		if (!isObj(arg)) return this
		for (const [key, val] of entries(arg))
			!readOnly ? this[key]=val : setReadonlyProp(this, key, val)
		return this
	},
	readOnly(arg) {
		return this.prop(arg, true)
	},
	text(text) {
		return !arguments.length
			?  this.textContent
			: (this.textContent=text,this)
	},
	attr(name, value) {
		return arguments.length == 1
			?  this.getAttribute(name)
			: (this.setAttribute(name, value),this)
	},
	removeAttr(...names) {
		for (const name of names) this.removeAttribute(name)
		return this
	},
	hasClass(name) {return this.classList.contains(name)},
	toggleClass (...args) {this.classList.toggle (...args); return this},
	replaceClass(...args) {this.classList.replace(...args); return this},
	addClass    (...names){this.classList.add    (...names);return this},
	removeClass (...names){this.classList.remove (...names);return this},
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
			: isNum(num) ? this.css('font-size',`${num}px`) : this
	},
	opacity(arg=null, fade=-1) {
		if (!arguments.length) return +this.css('opacity')
		this.style.transition = fade > 0 ? `opacity ${fade}ms` : null
		return isNum(+arg) ? this.css('opacity', clamp(+arg, 0, 1)) : this
	},
	css(prop, val, priority) {
		return arguments.length == 1
			? (this.style.getPropertyValue(prop) || getComputedStyle(this)[prop])
			: (this.style.setProperty(prop, val, priority ? 'important' : ''), this)
	},
})