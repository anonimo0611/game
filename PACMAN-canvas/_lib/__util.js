'use strict'
const {isArray}= Array
const {defineProperty,entries,freeze,hasOwn,keys,values}= Object
const {abs,ceil,floor,max,min,PI,random,round,sqrt,trunc:int}= Math

const isBool = arg=> arg === true || arg === false
const isStr  = arg=> typeof(arg) == 'string'
const isNum  = arg=> typeof(arg) == 'number' && !isNaN(arg)
const isObj  = arg=> typeof(arg) == 'object' && arg !== null && !isArray(arg)
const isFun  = arg=> typeof(arg) == 'function'

const lerp    = (x, y, p)  => x + (y-x) * p
const norm    = (x, y, p)  => (p-x) / (y-x)
const randInt = (min, max) => int(random() * (max-min+1) + min)
const clamp   = (n,min,max)=> Math.min(Math.max(n,min), max)
const between = (n,min,max)=> (n >= min && n <= max)

const randChoice = array=>
	isArray(array) && array[randInt(0, array.length-1)] || undefined

const splitByBar = str=>
	isStr(str) && (str=str.trim()) && String(str).split('|') || []

const collisionCircle = (v1, v2, r1, r2)=>
	(v1.x-v2.x)**2 + (v1.y-v2.y)**2 <= (r1+(r2 ?? r1))**2

const circumPosition = (deg, r, cx=0, cy=0)=>
	[Math.cos(PI/180*deg)*r+cx, Math.sin(PI/180*deg)*r+cy]

const isKeyboardEvent = e=>
	isObj(e) && (e.originalEvent || e) instanceof KeyboardEvent

const isCombinationKey = e=>
	isKeyboardEvent(e) && !!(e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)

const dRoot  = document.documentElement
const dqs    = sel=> document.querySelector(sel)
const dqsAll = sel=> document.querySelectorAll(sel)
const byId   = id => document.getElementById(id)