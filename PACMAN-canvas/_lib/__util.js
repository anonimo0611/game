'use strict'
const {defineProperty,entries,freeze,hasOwn,keys,values}= Object
const {abs,ceil,floor,max,min,PI,random,round,sqrt,trunc:int}= Math

const dRoot = document.getElementsByTagName('html')[0]
const byId  = (/**@type {string}*/elementId)=>
	document.getElementById(elementId)

/** @param {KeyboardEvent|JQuery.KeyboardEventBase} e */
const keyRepeat = e=>
	(e instanceof KeyboardEvent ? e : e.originalEvent)?.repeat ?? false

/** @param {WheelEvent|JQuery.TriggeredEvent} e */
const wheelDeltaY = e=> /**@type {WheelEvent}*/
	(e instanceof WheelEvent ? e : e.originalEvent)?.deltaY ?? 0

/** @param {KeyboardEvent|JQuery.KeyboardEventBase} e */
const isEnterKey = e=> /^(\x20|Enter)$/.test(e.key)

/** @param {unknown} e */
const nonEnterKey = e=> e instanceof KeyboardEvent && !isEnterKey(e)

/** @param {KeyboardEvent|JQuery.KeyboardEventBase} e */
const isCombiKey = e=> (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)

/**
 * @param {number} from
 * @param {number} [to]
 * @param {number} [step]
 */
const range = function*(from, to, step=1) {
	if (step === 0) throw new RangeError('The 3rd argument must not be zero')
	if (to === undefined) [to,from] = [from,0]
	if (step > 0) for (let i=from; i<to; i+=step) yield i
	if (step < 0) for (let i=from; i>to; i+=step) yield i
}

/**
 * @template T
 * @param {string|number} key
 * @param {{[key:string]:()=> T}} pattern
 */
const match = (key,pattern)=> {
	if (hasOwn(pattern,key))
		return pattern[key]()
	for (const k in pattern)
		if (k.split('_').some(k=> k == key))
			return pattern[k]()
	return pattern['_']?.() ?? undefined
}

/**
 * @param {string} selector
 * @return {?HTMLElement}
 */const qS = selector=> document.querySelector(selector)

/**
 * @param {string} selector
 */const qSAll = selector=> /**@type {HTMLElement[]}*/
 	([...document.querySelectorAll(selector)])

/**
 * @typedef {{dist:number, i:number}} DistObject
 * @type {(a:DistObject, b:DistObject)=> number}
 */const compareDist = (a,b)=>
	(a.dist == b.dist)? (a.i-b.i) : (a.dist-b.dist)

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
 * @param {readonly T[]} array
 * @returns {T}
 */const randChoice = array=> array[randInt(0, array.length-1)]

 /**
 * @template T
 * @param {readonly T[]} a
 * @param {number} size
 * @returns {T[][]}
 */const chunk = (a, size)=>
    Array.from({length:ceil(a.length/size)},
        (_,i)=> a.slice(i*size, i*size + size))

/**
 * @param {Position} v1
 * @param {Position} v2
 * @param {number}   r1
 * @param {number}  [r2]
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

const $win = $(window)
const $doc = $(document)

/** @param {Function} fn */
const $ready = fn=> $doc.on({DOMContentLoaded:fn}) && $win

/** @param {Function} fn */
const $load = fn=> $win.on({load:fn})

/** @param {string} elementId */
const $byId = elementId=> $('#'+elementId)

/**
 * @param {string} ns
 * @param {{[event:string]:Function}} cfg
 */
const $onNS = (ns,cfg)=> {
	entries(cfg).forEach(([ev,fn])=> {
		ev = ev.trim().replace(/[_\s]+|$/g,`${ns} `)
		$offon(ev,fn)
	})
	return $win
}

/** @param {string} event */
const $off = event=> $win.off(event.trim().replace(/_/g,' '))

/**
 * @param {string} event
 * @param {Function} fn
 */
const $offon = (event,fn)=> $off(event) && $on(event,fn)

/**
 * @param {string} event
 * @param {*} [data]
 */
const $trigger = (event,data)=> $win.trigger(event,data)

/**
 * @param {string|object} arg
 * @param {Function} [fn]
 * @type {{
 *    (event:string, fn:Function):    JQuery<typeof globalThis>
 *    (arg:{[event:string]:Function}):JQuery<typeof globalThis>
 * }}
 */
const $on = (arg, fn)=> {
	const rep = (/**@type {string}*/str)=> str.trim().replace(/_/g,' ')
	typeof(arg) != 'object'
		? $win.on({[rep(arg)]:fn})
		: entries(arg).forEach(([ev,fn])=> $win.on(rep(ev),fn))
	return $win
}