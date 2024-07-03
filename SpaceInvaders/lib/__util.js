'use strict'
const {isArray}= Array
const {assign,defineProperty,entries,freeze,getOwnPropertyNames,hasOwn,keys,values}= Object
const {abs,atan2,ceil,cos,floor,max,min,PI,random,round,sign,sin,sqrt,trunc:int}= Math

const typeOf   = arg=> String(Object.prototype.toString.call(arg).slice(8,-1))
const integers = len=> [...Array(+len).keys()]
const hasIter  = arg=> arg !== null && Symbol.iterator in Object(arg)
const isBool   = arg=> arg === true || arg === false
const isElm    = arg=> arg instanceof HTMLElement
const isStr    = arg=> typeof(arg) === 'string'
const isNum    = arg=> typeof(arg) === 'number' && !isNaN(arg)
const isObj    = arg=> typeof(arg) === 'object' && arg !== null && !isArray(arg)
const isFun    = arg=> typeof(arg) === 'function'

const dRoot  = document.documentElement
const dqs    = sel=> document.querySelector(sel)
const dqsAll = sel=> document.querySelectorAll(sel)
const byId   = id => document.getElementById(id)

const between    = (n, min, max) => (n >= min && n <= max)
const clamp      = (n, min, max) => Math.min(Math.max(n,min), max)
const randInt    = (min, max)    => int(random() * (max-min+1) + min)
const randFloat  = (min, max)    => random() * (max-min) + min
const splitByBar = (arg)         => isStr(arg) && (arg=arg.trim()) && arg.split('|') || []
const toNumber   = (arg, def=NaN)=> !isNum(+arg) || !isNum(arg)
	&& !isStr(arg) || String(arg).trim() === '' ? def : +arg

const randChoice = (...args)=> {
	if (args.length == 1 && isArray(args[0])) {
		args = args[0];
	}
	return isArray(args) ? args[randInt(0, args.length-1)] : []
}

const collisionRect = (a, b)=> {
	if (!isObj(a) || !isObj(b))
		return false;
	const ax = a.Pos?.x;
	const ay = a.Pos?.y;
	const bx = b.Pos?.x;
	const by = b.Pos?.y;
	return (
		abs((ax+a.Width /2)-(bx+b.Width /2)) < (a.Width +b.Width) /2 &&
		abs((ay+a.Height/2)-(by+b.Height/2)) < (a.Height+b.Height)/2);
}