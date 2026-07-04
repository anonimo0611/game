'use strict'
const {fromEntries:toObj,defineProperty,freeze,hasOwn}= Object
const {abs,asin,atan2,ceil,cos,floor,max,min,PI,random,round,sin,sqrt,trunc:int}= Math

/**
 @template {object} T
 @param {T} o
*/const getKeys = o=>
	/**@type {(keyof T)[]}*/(Object.keys(o))

/**
 @template {string} K
 @template V
 @param {{[key in K]?:V}} o
*/const getVals = o=>
	/**@type {V[]}*/(Object.values(o))

/**
 @template {string} K
 @template V
 @param {{[key in K]?:V}} o
*/const entries = o=>
	/**@type {[K,V][]}*/(Object.entries(o))

/**
 @template {string} T
 @param {T[]} array
*/const asEnum = (...array)=>
	/**@type {{readonly [K in T]:K}}*/
	(toObj(array.map(k=> [k,k])))

/**
 @template {object} O
 @param {O} obj
*/const readOnly = obj=>
	/**@type Readonly<O>*/(obj)

/**
 @param {KeyboardEvent|JQKeyboardEvent} e
*/const getNativeKeyEvent = e=>
	(e instanceof KeyboardEvent)
		? e :(e.originalEvent instanceof KeyboardEvent)
			? e.originalEvent : null

/**
 @param {KeyboardEvent|JQKeyboardEvent} e
*/const hasModifierKeys = e=>
	(e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)

/**
 @param {KeyboardEvent|JQKeyboardEvent|JQTriggeredEvent} e
*/const isActionKey = e=>
	(e.key == '\x20' || e.key == 'Enter')

/**
 @param {KeyboardEvent|JQKeyboardEvent} e
*/const keyRepeated = e=>
	getNativeKeyEvent(e)?.repeat || false

/**
 @template {new ()=> HTMLElement} T
 @param {string|HTMLElement} src
 @param {T} [type]
*/const reqElem = (src, type=/**@type {any}*/(HTMLElement))=> {
	const e = (typeof src == 'string')? qSel(src) : src
	if (!e) throw ReferenceError(`No ${type.name} with that id #${src} exists.`)
	if (e instanceof type) return /**@type {InstanceType<T>}*/(e)
	throw TypeError(`Expected ${type.name}, but got ${e}.`)
}

/**
 @param {string|HTMLElement} src
*/const reqInput = src=> reqElem(src,HTMLInputElement)

/**
 @param {string|HTMLElement} src
*/const reqButton = src=> reqElem(src,HTMLButtonElement)

/**
 @param  {string} selector
 @return {?HTMLElement}
*/const qSel = selector=> document.querySelector(selector)

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
*/const mathLerp = (start,end,ratio)=> start + (end-start) * mathClamp(ratio,0,1)

/**
 @param {number} min
 @param {number} max
 @param {number} val
 @returns {number} 0.0-1.0
*/const mathNorm = (min,max,val)=> (max === min)? 0 : (val-min)/(max-min)

/**
 @param {number} n
 @param {number} min
 @param {number} max
*/const mathClamp = (n,min,max)=> Math.min(Math.max(n,min), max)

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
*/const isBetween = (n,min,max)=> (n >= min && n <= max)

/**
 @param {string} str
 @param {number} size
*/const cyclicIndexMap = (str,size)=>
	new Map(Array.from(str, (v,i)=> [v,i % size]))

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
const $root = $(document.documentElement)

/**
 @param {string} ns
 @param {Record<string,()=> void>} handlers
 @param {boolean} [force]
*/jQuery.fn.onNS = function(ns, handlers, force) {
	const NS = ns[0] != '.' ? `.${ns}` : ns
	if (force === false) return this.off(NS)
	entries(handlers).forEach(([e,cb])=> {
		const ev = e.trim().replace(/[_\s]+/g,`${NS}\x20`) + NS
		this.off(ev).on(ev,cb)
	})
	return this
}
/**
 @param {string} events
 @param {JQTriggerHandler} handler
 @param {boolean} [force]
 @memberof jQuery.fn
*/jQuery.fn.offon = function(events, handler, force) {
	return (force === false)
		? this.off(events)
		: this.off(events).on(events, handler)
}
/**
 @param {(ev:WheelEvent)=> void} handler
 @memberof jQuery.fn
*/jQuery.fn.onWheel = function(handler) {
	return this.each(function() {
		this.addEventListener('wheel', handler, {passive:false})
	})
}