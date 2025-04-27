'use strict'
const {isArray}= Array
const {defineProperty,entries,freeze,hasOwn,keys,values}= Object
const {abs,ceil,floor,max,min,PI,random,round,sqrt,trunc:int}= Math

const isBool = arg=> arg === true || arg === false
const isStr  = arg=> typeof(arg) == 'string'
const isNum  = arg=> typeof(arg) == 'number' && !isNaN(arg)
const isObj  = arg=> typeof(arg) == 'object' && arg !== null && !isArray(arg)
const isFun  = arg=> typeof(arg) == 'function'

const isKeyboardEvent = e=>
	isObj(e) && (e.originalEvent || e) instanceof KeyboardEvent

const keyRepeat = e=>
	isKeyboardEvent(e) && !!(e.originalEvent || e).repeat

const isCombinationKey = e=>
	isKeyboardEvent(e) && !!(e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)

/**
 * @param {{index:number,dist:number}} a
 * @param {{index:number,dist:number}} b
 */
const compareDist = (a,b)=>
	(a.dist == b.dist)? (a.index-b.index) : (a.dist-b.dist)

/**
 * @param {number} x
 * @param {number} y
 * @param {number} s
 */
const lerp = (x,y,s)=> x + (y-x) * s

/**
 * @param {number} x
 * @param {number} y
 * @param {number} p
 */
const norm = (x,y,p)=> (p-x) / (y-x)

/**
 * @param {number} min
 * @param {number} max
 */
const randInt = (min,max)=> int(random() * (max-min+1) + min)

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 */
const clamp = (n,min,max)=> Math.min(Math.max(n,min), max)

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 */
const between = (n,min,max)=> (n >= min && n <= max)

/**
 * @template T
 * @param {Array<T>} array
 * @returns {T|undefined}
 */
const randChoice = array=>
	isArray(array) && array[randInt(0, array.length-1)] || undefined

/**
 * @param {Position} v1
 * @param {Position} v2
 * @param {number} r1
 * @param {number} r2
 */
const collisionCircle = (v1,v2,r1,r2)=>
	(v1.x-v2.x)**2 + (v1.y-v2.y)**2 <= (r1+(r2 ?? r1))**2

/**
 * @param {number} deg
 * @param {number} r
 * @returns {[x:number, y:number]}
 */
const circumPosition = (deg, r, cx=0, cy=0)=>
	[Math.cos(PI/180*deg)*r+cx,
	 Math.sin(PI/180*deg)*r+cy]

/** @type {HTMLHtmlElement} */
const dRoot = document.documentElement

/** @param {string} id */
const byId = id=> document.getElementById(id)

/**
 * @param {string} selector
 * @return {?HTMLElement}
 */
const dqs = selector=> document.querySelector(selector)

/**
 * @param {string} selector
 * @return {NodeListOf<HTMLElement>}
 */
const dqsAll = selector=> document.querySelectorAll(selector)