'use strict'
const {isArray}= Array
const {assign,defineProperty,entries,freeze,getOwnPropertyNames,hasOwn,keys,values}= Object
const {abs,atan2,ceil,cos,floor,max,min,PI,random,round,sign,sin,sqrt,trunc:int}= Math
const dRoot    = document.documentElement
const typeOf   = arg => String(Object.prototype.toString.call(arg).slice(8,-1))
const integers = len => [...Array(+len).keys()]
const hasIter  = arg => arg !== null && Symbol.iterator in Object(arg)
const isBool   = arg => arg === true || arg === false
const isElm    = arg => arg instanceof HTMLElement
const isObj    = arg => typeof(arg) === 'object' && !isArray(arg)
const isStr    = arg => typeof(arg) === 'string'
const isFun    = arg => typeof(arg) === 'function'
const isNum    = arg => typeof(arg) === 'number' && !isNaN(arg)
const dqs      = sel => document.querySelector(sel)
const dqsAll   = sel => document.querySelectorAll(sel)
const byId     = id  => document.getElementById(id)
const byIds    = arg => {
	if (!hasIter(arg)) return []
	if (isStr(arg)) arg = arg.trim().split('|')
	const elms = []
	for (const id of arg) {
		if (!byId(id)) throw ReferenceError(`The element with id '${id}' not found`)
		elms.push(byId(id))
	} return elms
}
const between    = (n, min, max)  => (n >= min && n <= max)
const clamp      = (n, min, max)  => Math.min(Math.max(n,min), max)
const randFloat  = (min, max)     => random() * (max-min) + min
const randInt    = (min, max)     => int(random() * (max-min+1) + min)
const randChoice = arg            => isArray(arg) ? arg[randInt(0, arg.length-1)] : []
const getDist    = (v1={}, v2={}) => sqrt((v1.x-v2.x)**2 + (v1.y-v2.y)**2)
const toNumber   = (arg, def=arg) => !isNum(+arg) || !isNum(arg)
	&& !isStr(arg) || String(arg).trim() === '' ? def : +arg

const deepFreeze = obj=> {
	function freeze(o) {
		if (isElm(o)) return o
		for (const key of getOwnPropertyNames(o)) {
			const desc = Object.getOwnPropertyDescriptor(o, key)
			if (desc.get || desc.set) continue
			if (o[key] && typeof o[key] === 'object') freeze(o[key])
		} return Object.freeze(o)
	} return freeze(obj)
}
const makeDiv = (selector='')=> makeElm(`div${selector}`)
const makeElm = (selector='')=> { // The attribute value should be alphanumerical
	if (!isStr(selector)) throw TypeError(`'${selector}' is not a string`)
	if (!/^\s*[\w-]+/.test(selector)) throw SyntaxError('Element type is invalid')
	const atRE  = /\[([a-z][a-z\d_-]+)=[\x27\x22]?([^#\.\[\]\x27\x22]+?)[\x27\x22]?\]/i
	const cElm  = document.createElement(selector.trim().match(/^[\w-]+/)[0])
	const ids   = selector.match(/#[a-z][a-z\d_-]+/gi)
	const cls   = selector.match(/(\.[^#\.\[\]]+)+/gi)?.join('')
	const attrs = selector.match(RegExp(atRE,'gi')) || []
	if (ids) cElm.id = ids.at(-1).slice(1)
	if (cls) cElm.className = cls.split('.').join('\x20').trim()
	attrs.forEach(attr=> cElm.setAttribute(...atRE.exec(attr).slice(1)))
	return cElm
}
const makeImage = path=> {
	const img = new Image();
	img.src = path;
	return img;
}