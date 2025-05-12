'use strict'
const {isArray}= Array
const {defineProperty,entries,freeze,hasOwn,keys,values}= Object
const {abs,ceil,floor,max,min,PI,random,round,sqrt,trunc:int}= Math

const dRoot  = document.getElementsByTagName('html')[0]
const byId   = (/**@type {string} */elementId)=> document.getElementById(elementId)
const isObj  = (/**@type {unknown}*/arg)=> typeof(arg)=='object' && !!arg && !isArray(arg)
const isBool = (/**@type {unknown}*/arg)=> arg === true || arg === false

/** @param {KeyboardEvent|JQuery.KeyDownEvent} e */
const keyRepeat = e=> !!(e instanceof KeyboardEvent ? e : e.originalEvent)?.repeat

/** @param {WheelEvent|JQuery.TriggeredEvent} e */
const wheelDeltaY = e=> /** @type {WheelEvent} */
	(e instanceof WheelEvent ? e : e.originalEvent)?.deltaY ?? 0

/** @param {KeyboardEvent|JQuery.KeyDownEvent} e */
const isEnterKey = e=> /^(\x20|Enter)$/.test(e.key)

/** @param {KeyboardEvent|JQuery.KeyDownEvent} e */
const isCombinationKey = e=> (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)

/**
 * @param {string} selector
 * @return {?HTMLElement}
 */const qS = selector=> document.querySelector(selector)

/**
 * @param {string} selector
 */const qSAll = selector=> /**@type {HTMLElement[]}*/
 	([...document.querySelectorAll(selector)])

/**
 * @param {string} className
 */const byClass = className=> /**@type {HTMLElement[]}*/
	([...document.getElementsByClassName(className)])

/**
 * @typedef {{dist:number, index:number}} DistObject
 * @type {(a:DistObject, b:DistObject)=> number}
 */const compareDist = (a,b)=>
	(a.dist == b.dist)? (a.index-b.index) : (a.dist-b.dist)

 /**
  * @template T
  * @param {T|null|undefined} arg
  * @returns {T}
  */const asNotNull = arg=> {
	if (!arg) throw TypeError('Does not have a specific value')
	return arg
  }

/**
 * @param {number} x
 * @param {number} y
 * @param {number} s
 */const lerp = (x,y,s)=> x + (y-x) * s

/**
 * @param {number} x
 * @param {number} y
 * @param {number} p
 */const norm = (x,y,p)=> (p-x) / (y-x)

/**
 * @param {number} min
 * @param {number} max
 */const randInt = (min,max)=> int(random() * (max-min+1) + min)

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 */const clamp = (n,min,max)=> Math.min(Math.max(n,min), max)

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 */const between = (n,min,max)=> (n >= min && n <= max)

/**
 * @template T
 * @param {Array<T>} array
 * @returns {T}
 */const randChoice = array=> array[randInt(0, array.length-1)]

/**
 * @param {Position} v1
 * @param {Position} v2
 * @param {number} r1
 * @param {number} [r2]
 */const collisionCircle = (v1,v2,r1,r2=r1)=>
	(v1.x-v2.x)**2 + (v1.y-v2.y)**2 <= (r1+(r2 ?? r1))**2

/**
 * @param {number} deg
 * @param {number} r
 * @returns {[x:number, y:number]}
 */const circumPosition = (deg, r, cx=0, cy=0)=>
	[Math.cos(PI/180*deg)*r+cx,
	 Math.sin(PI/180*deg)*r+cy]

//---- jQuery utilities ------

/** @param {Function} fn */
const $ready = fn=> $(document).on({DOMContentLoaded:fn}) && $(window)

/** @param {Function} fn */
const $load = fn=> $(window).on({load:fn})

/** @param {string} elementId */
const $byId = elementId=> $('#'+elementId)

/**
 * @param {string} ns
 * @param {Object.<string,Function>} cfg
 */
const $onNS = (ns,cfg)=> {
	entries(cfg).forEach(([ev,fn])=> {
		ev = ev.trim().replace(/[_\s]+|$/g,`${ns} `)
		$offon(ev,fn)
	})
	return $(window)
}

/** @param {string} event */
const $off = event=> $(window).off(event.trim().replace(/_/g,' '))

/**
 * @param {string} event
 * @param {Function} fn
*/
const $offon = (event,fn)=> $off(event) && $on(event, fn)

/**
 * @param {string} event
 * @param {*} [data]
 */
const $trigger = (event,data)=> $(window).trigger(event, data)

/**
 * @param {string|object} arg
 * @param {Function} [fn]
 * @type {{
 *    (arg:string, fn:Function):  JQuery<typeof globalThis>
 *    (arg:{[x:string]:Function}):JQuery<typeof globalThis>
 * }}
 */
const $on = (arg, fn)=> {
	const rep = (/**@type {string}*/str)=> str.trim().replace(/_/g,' ')
	typeof(arg) != 'object'
		? $(this).on({[rep(arg)]:fn})
		: entries(arg).forEach(([ev,fn])=>$(this).on(rep(ev),fn))
	return $(this)
}