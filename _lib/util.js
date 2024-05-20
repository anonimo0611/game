'use strict'
const {isArray}= Array
const {assign,defineProperty,entries,freeze,hasOwn,keys,values}= Object
const {PI,cos,sin,atan2,abs,min,max,sqrt,random,round,trunc:int}= Math

const typeOf   = arg => String(Object.prototype.toString.call(arg).slice(8,-1))
const integers = len => [...Array(+len).keys()]
const hasIter  = arg => arg !== null && Symbol.iterator in Object(arg)
const isBool   = arg => arg === true || arg === false
const isElm    = arg => arg instanceof HTMLElement
const isStr    = arg => typeof(arg) === 'string'
const isNum    = arg => typeof(arg) === 'number' && !isNaN(arg)
const isObj    = arg => typeof(arg) === 'object' && arg !== null && !isArray(arg)
const isFun    = arg => typeof(arg) === 'function'

const dRoot  = document.documentElement
const dqs    = sel => document.querySelector(sel)
const dqsAll = sel => document.querySelectorAll(sel)
const byId   = id  => document.getElementById(id)
const byIds  = arg => {
	if (!hasIter(arg)) return []
	if (isStr(arg)) arg = splitByBar(arg)
	const elms = []
	for (const id of arg) {
		if (!byId(id)) break
		elms.push(byId(id))
	} return elms
}

const between   = (n, min, max)  => (n >= min && n <= max)
const clamp     = (n,_min,_max)  => min(max(n,_min), _max)
const randInt   = (min, max)     => int(random() * (max-min+1) + min)
const getDist   = (v1={}, v2={}) => sqrt((v1.x-v2.x)**2 + (v1.y-v2.y)**2)
const vecDivInt = (v={}, scalar) => ({x:v.x/scalar|0, y:v.y/scalar|0})
const toNumber  = (arg, def=NaN) => !isNum(+arg) ||
	!isNum(arg) && !isStr(arg) || String(arg).trim() === '' ? def : +arg

const deepFreeze = obj=> {
	function freeze(o) {
		if (isElm(o)) return o
		for(const key of Object.getOwnPropertyNames(o)) {
			const desc = Object.getOwnPropertyDescriptor(o, key)
			if (desc.get || desc.set) continue
			if (o[key] && typeof o[key] === 'object') freeze(o[key])
		} return Object.freeze(o)
	} return freeze(obj)
}
const initFlags = (obj, nameListStr='')=> {
	(obj??={}) && splitByBar(nameListStr).forEach(name=> obj[`is${name}`]=false)
	return obj
}
const makeDiv = (selector='')=> makeElm(`div${selector}`)
const makeElm = (selector='')=> { // The attribute value should be alphanumerical
	if (!isStr(selector))
		throw TypeError(`'${selector}' is not a string`)
	if (!/^\s*[\w-]+/.test(selector))
		throw SyntaxError('Element type is invalid')

	const atRE  = /\[([a-z][a-z\d_-]+)=[\x27\x22]?([^#\.\[\]\x27\x22]+?)[\x27\x22]?\]/i
	const nElm  = document.createElement(selector.trim().match(/^[\w-]+/)[0])
	const ids   = selector.match(/#[a-z][a-z\d_-]+/gi)
	const cls   = selector.match(/(\.[^#\.\[\]]+)+/gi)?.join('')
	const attrs = selector.match(RegExp(atRE,'gi')) || []
	if (ids) nElm.id = ids.at(-1).slice(1)
	if (cls) nElm.className = cls.split('.').join('\x20').trim()
	attrs.forEach(attr=> nElm.setAttribute(...atRE.exec(attr).slice(1)))
	return nElm
}
const splitByBar = arg => isStr(arg) && (arg=arg.trim()) && arg.split('|') || []
const randChoice = arg => isArray(arg)? arg[randInt(0, arg.length-1)] : []
const getCircum  = (degree,r,cx,cy)=> {
	const x = cos(PI/180*degree) * r + cx
	const y = sin(PI/180*degree) * r + cy
	return {pos:{x, y}, values:[x, y]}
}