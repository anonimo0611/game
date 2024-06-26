'use strict'
const {isArray}= Array
const {assign,defineProperty,entries,freeze,hasOwn,keys,values}= Object
const {abs,atan2,ceil,cos,floor,max,min,PI,random,round,sign,sin,sqrt,trunc:int}= Math

const typeOf   = arg => String(Object.prototype.toString.call(arg).slice(8,-1))
const integers = len => [...Array(+len).keys()]
const hasIter  = arg => arg !== null && Symbol.iterator in Object(arg)
const isBool   = arg => arg === true || arg === false
const isElm    = arg => arg instanceof HTMLElement
const isObj    = arg => typeof(arg) === 'object' && arg !== null && !isArray(arg);
const isStr    = arg => typeof(arg) === 'string'
const isFun    = arg => typeof(arg) === 'function'
const isNum    = arg => typeof(arg) === 'number' && !isNaN(arg)

const dRoot  = document.documentElement
const dBody  = document.body
const dqs    = sel => document.querySelector(sel)
const dqsAll = sel => document.querySelectorAll(sel)
const byId   = id  => document.getElementById(id)
const byIds  = arg => {
	if (!hasIter(arg)) {
		return []
	}
	if (isStr(arg)) {
		arg = [arg.trim().split('|')].flat()
	}
	return [...arg].map(id=> {
		if (!byId(id))
			throw ReferenceError(`The element with id '${id}' not found`)
		return byId(id)
	});
}

const lerp      = (x, y, p)     => x + (y - x) * p
const norm      = (x, y, p)     => (p - x) / (y - x)
const toRadians = (deglee)      => deglee * PI/180
const between   = (n, min, max) => (n >= min && n <= max)
const clamp     = (n, min, max) => Math.min(Math.max(n,min), max)
const randInt   = (min, max)    => int(random() * (max-min+1) + min)
const randFloat = (min, max)    => random() * (max-min) + min
const toNumber  = (arg, def=NaN)=> !isNum(+arg) || !isNum(arg)
	&& !isStr(arg) || String(arg).trim() === '' ? def : +arg

const randChoice = (...args)=> {
	if (args.length == 1 && isArray(args[0])) {
		args = args[0];
	}
	return isArray(args) ? args[randInt(0, args.length-1)] : []
}
const splitByBar  = arg=> {
	return isStr(arg) && (arg=arg.trim()) && arg.split('|') || []
}
const deepFreeze = obj=> {
	function freeze(o) {
		if (isElm(o)) {
			return o
		}
		for (const key of Object.getOwnPropertyNames(o)) {
			const desc = Object.getOwnPropertyDescriptor(o, key)
			if (desc.get || desc.set) {
				continue
			}
			if (o[key] && typeof o[key] === 'object') {
				freeze(o[key])
			}
		} return Object.freeze(o)
	} return freeze(obj)
}