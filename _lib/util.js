'use strict'
const {isArray}= Array
const {assign,defineProperty,entries,freeze,hasOwn,keys,values}= Object
const {PI,cos,sin,atan2,abs,min,max,sqrt,random,round,trunc:int}= Math

const isBool = arg => arg === true || arg === false
const isElm  = arg => arg instanceof HTMLElement
const isStr  = arg => typeof(arg) === 'string'
const isNum  = arg => typeof(arg) === 'number' && !isNaN(arg)
const isObj  = arg => typeof(arg) === 'object' && arg !== null && !isArray(arg)
const isFun  = arg => typeof(arg) === 'function'

const dRoot  = document.documentElement
const dqs    = sel => document.querySelector(sel)
const dqsAll = sel => document.querySelectorAll(sel)
const byId   = id  => document.getElementById(id)

const between    = (n, min, max)  => (n >= min && n <= max)
const clamp      = (n,_min,_max)  => min(max(n,_min), _max)
const randInt    = (min, max)     => int(random() * (max-min+1) + min)
const getDist    = (v1={}, v2={}) => sqrt((v1.x-v2.x)**2 + (v1.y-v2.y)**2)
const splitByBar = arg => isStr(arg) && (arg=arg.trim()) && arg.split('|') || []
const randChoice = arg => isArray(arg)? arg[randInt(0, arg.length-1)] : []
const toNumber   = (arg, def=NaN) => !isNum(+arg) ||
	!isNum(arg) && !isStr(arg) || String(arg).trim() === '' ? def : +arg

'on|off|offon|one|trigger|ready'.split('|').forEach(m=> {
	window['$'+m]= (...a)=> $(window)[m](...a)
	Object.defineProperty(window,'$'+m,{writable:false})
})