'use strict'
const {isArray}= Array
const {assign,keys,values,entries,freeze,hasOwn,defineProperty,getOwnPropertyNames}= Object
const {PI,sin,atan2,cos,min,max,abs,sqrt,random,round,ceil,floor,trunc:int}= Math

const typeOf   = arg=> String(Object.prototype.toString.call(arg).slice(8,-1))
const integers = len=> [...Array(+len).keys()]
const hasIter  = arg=> arg !== null && Symbol.iterator in Object(arg)
const isBool   = arg=> arg === true || arg === false
const isElm    = arg=> arg instanceof HTMLElement
const isObj    = arg=> typeof(arg) === 'object' && !isArray(arg)
const isStr    = arg=> typeof(arg) === 'string'
const isFun    = arg=> typeof(arg) === 'function'
const isNum    = arg=> typeof(arg) === 'number' && !isNaN(arg)

const dRoot  = document.documentElement
const dqs    = sel=> document.querySelector(sel)
const dqsAll = sel=> document.querySelectorAll(sel)
const byId   = id => document.getElementById(id)

const between  = (n, min, max) => (n >= min && n <= max)
const clamp    = (n, min, max) => Math.min(Math.max(n,min), max)
const randInt  = (min, max)    => int(random() * (max-min+1) + min)
const toNumber = (arg, def=NaN)=> !isNum(+arg) || !isNum(arg)
	&& !isStr(arg) || String(arg).trim() === '' ? def : +arg

const setReadonly = (obj, cfg)=> {
	for (const [key,v] of entries(cfg))
		defineProperty(obj, key, {get(){return v}})
}