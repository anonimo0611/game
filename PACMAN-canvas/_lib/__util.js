'use strict'
const {fromEntries,defineProperty,freeze,hasOwn}= Object
const {abs,asin,atan2,ceil,cos,floor,max,min,PI,random,round,sin,sqrt,trunc:int}= Math

/**
 @template {object} T
 @param {T} o
*/const keys = o=>
	/**@type {(keyof T)[]}*/(Object.keys(o))

/**
 @template {string} K
 @template V
 @param {{[key in K]?:V}} o
 @returns {V[]}
*/const values = o=> Object.values(o)

/**
 @template {string} K
 @template V
 @param {{[key in K]?:V}} o
*/const entries = o=>
	/**@type {[K,V][]}*/(Object.entries(o))

/**
 @template {string} T
 @param {T[]} array
*/const enumObj = (...array)=>
	/**@type {{readonly [K in T]:K}}*/(fromEntries(array.map(k=> [k,k])))

/**
 @param {KeyboardEvent|JQKeyboardEvent} e
*/const getNativeKeyEvent = e=>
	(e instanceof KeyboardEvent)
		? e :(e.originalEvent instanceof KeyboardEvent)
			? e.originalEvent : null

/**
 @param {KeyboardEvent|JQKeyboardEvent} e
*/const hasModifierKeys = e=> (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)

/**
 @param {KeyboardEvent|JQKeyboardEvent} e
*/const keyRepeat = e=> getNativeKeyEvent(e)?.repeat || false

/**
 @param {KeyboardEvent|JQKeyboardEvent|JQTriggeredEvent} e
*/const isEnterKey = e=> (e.key == '\x20' || e.key == 'Enter')

/**
 @param {string} id
*/const requireElem = id=> {
	let elem = document.getElementById(id)
	if (elem) return elem
	throw ReferenceError(`There is no element with the ID “${id}”.`)
}

/**
 @param  {string} selector
 @return {?HTMLElement}
*/const qS = selector=> document.querySelector(selector)

/**
 @param {string} str
*/const underscoreToSp = (str,prefix='')=>
	str.indexOf('_') != -1
		? `${prefix} ${str}`.replace(/[_\s]+/g,'\x20').trim()
		: str.trim()

/**
 @param {number} start
 @param {number} end
 @param {number} ratio 0.0-1.0
*/const lerp = (start,end,ratio)=> start + (end-start) * clamp(ratio,0,1)

/**
 @param {number} min
 @param {number} max
 @param {number} val
 @returns {number} 0.0-1.0
*/const norm = (min,max,val)=> (max === min)? 0 : (val-min)/(max-min)

/**
 @param {number} min
 @param {number} max
*/const randInt = (min,max)=> int(random() * (max-min+1) + min)

/**
 @template T
 @param {readonly T[]} array
 @returns {T}
*/const randChoice = array=> array[randInt(0, array.length-1)]

/**
 @param {number} n
 @param {number} min
 @param {number} max
*/const clamp = (n,min,max)=> Math.min(Math.max(n,min), max)

/**
 @param {number} n
 @param {number} min
 @param {number} max
*/const between = (n,min,max)=> (n >= min && n <= max)

/**
 @param {Position} pos1
 @param {Position} pos2
 @param {number}  r1  radius1
 @param {number} [r2] radius2
*/const circleCollision = (pos1, pos2, r1, r2=r1)=>
	(pos1.x-pos2.x)**2 + (pos1.y-pos2.y)**2 <= (r1+r2)**2

/**
 @param {number} rad
 @param {number} r
 @returns {{pos:Vec2,vals:[x:number, y:number]}}
*/const getPointOnCircle = (rad, r, cx=0, cy=0)=> {
	const  [x,y] = [cos(rad)*r+cx, sin(rad)*r+cy]
	return {pos:Vec2.new(x,y),vals:[x,y]}
}

//---- jQuery utilities ------

const $win  = $(window)
const $doc  = $(document)
const $root = $(document.documentElement)

/**
 @param {string} ns
 @param {Record<string,()=> void>} handlers
 @param {boolean} [force]
*/jQuery.fn.onNS = function(ns, handlers, force) {
	const NS = ns[0] != '.' ? `.${ns}` : ns
	if (force === false) return this.off(ns)
	entries(handlers).forEach(([ev,cb])=> {
		const ns = ev.trim().replace(/[_\s]+/g,`${NS}\x20`) + NS
		this.off(ns).on(ns,cb)
	})
	return this
}
/**
 @param {string} events
 @param {JQTriggerHandler} handler
 @param {boolean} [force]
*/jQuery.fn.offon = function(events, handler, force) {
	return (force === false)
		? this.off(events)
		: this.off(events).on(events, handler)
}
/**
 @param {(ev:WheelEvent)=> void} handler
*/jQuery.fn.onWheel = function(handler) {
	return this.each(function() {
		this.addEventListener('wheel', handler, {passive:false})
	})
}