'use strict'
const {defineProperty,entries,freeze,hasOwn,keys,values}= Object
const {abs,ceil,floor,max,min,PI,random,round,sqrt,trunc:int}= Math

/**
 @param {WheelEvent|JQuery.TriggeredEvent} e
*/const wheelDeltaY = e=>
	e instanceof WheelEvent? e.deltaY
		: e.originalEvent instanceof WheelEvent
			? e.originalEvent.deltaY : 0
/**
 @param {KeyboardEvent|JQuery.KeyboardEventBase} e
*/const keyRepeat = e=>
	(e instanceof KeyboardEvent? e : e.originalEvent)?.repeat ?? false

/**
 @param {KeyboardEvent|JQuery.KeyboardEventBase} e
*/const isCombiKey = e=> (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)

/**
 @param {KeyboardEvent|JQuery.KeyboardEventBase|JQuery.TriggeredEvent} e
*/const isEnterKey = e=> /^(\x20|Enter)$/.test(e?.key ?? '')

/**
 @template T
 @param {readonly T[]} array
*/const reverse = function*(array) {
	for (let i=array.length-1; i>=0; i--) yield array[i]
}

/**
 @param {number} from
 @param {number} [to]
 @param {number} [step]
*/const range = function*(from,to,step=1) {
	if (step === 0) throw new RangeError('The 3rd argument must not be zero')
	if (to === undefined) [to,from] = [from,0]
	if (step > 0) for (let i=from; i<to; i+=step) yield i
	if (step < 0) for (let i=from; i>to; i+=step) yield i
}

/**
 @template T
 @param {...T} args
*/const cycle = function*(...args) {while(1) yield* args}

/**
 @param {number} from
 @param {number} [to]
 @param {number} [step]
*/const cycleRange = function*(from,to,step) {
	while(1) yield* range(from,to,step)
}

/**
 @template T
 @param {string|number} key
 @param {{[key:string|number]:(_:void)=>T}} patterns
 @param {string} [separator]
*/
const match = (key, patterns, separator='|')=> {
    const keyStr = String(key)
    for (const key of keys(patterns))
        if (key !== '_' && key.split(separator).some(k=> k === keyStr))
			return patterns[key]()
    return patterns['_']?.() ?? undefined
}

/**
 @param {string} elementId
*/const byId = elementId=> document.getElementById(elementId)

/**
 @param  {string} selector
 @return {?HTMLElement}
*/const qS = selector=> document.querySelector(selector)

/**
 @param {string} selector
*/const qSAll = selector=> /**@type {NodeListOf<HTMLElement>}*/
 	(document.querySelectorAll(selector))

/**
 @typedef {{dist:number, idx:number}} DistComparator
 @type {(a:Readonly<DistComparator>, b:Readonly<DistComparator>)=> number}
*/const compareDist = (a,b)=>
	(a.dist == b.dist)? (a.idx-b.idx) : (a.dist-b.dist)

/**
 @param {string} str
*/const underscoreToSp = (str,prefix='')=> str.indexOf('_') != -1
 	? prefix.trim()+str.trim().replace(/_/g,'\x20')
	: str.trim()

/**
 @param {number} x
 @param {number} y
 @param {number} s
*/const lerp = (x,y,s)=> x + (y-x) * s

/**
 @param {number} x
 @param {number} y
 @param {number} p
*/const norm = (x,y,p)=> (p-x) / (y-x)

/**
 @param {number} min
 @param {number} max
*/const randInt = (min,max)=> int(random() * (max-min+1) + min)

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
 @template T
 @param {readonly T[]} array
 @returns {T}
*/const randChoice = array=> array[randInt(0, array.length-1)]

/**
 @template T
 @param {string} str
 @param {Iterable<T>} iterable
*/const trMap = (str,iterable)=> {
    const map = /**@type {Map<String,T>}*/(new Map)
    const itr = iterable[Symbol.iterator]()
    for(const char of str) {
        const {value,done}= itr.next()
        if (done) break; map.set(char,value)
    } return map
}

/**
 @param {Readonly<Position>} v1
 @param {Readonly<Position>} v2
 @param {number}  r1
 @param {number} [r2]
*/const circleCollision = (v1,v2,r1,r2=r1)=>
	(v1.x-v2.x)**2 + (v1.y-v2.y)**2 <= (r1+r2)**2

/**
 @param {number} deg
 @param {number} r
 @returns {[x:number, y:number]}
*/const circumPosition = (deg, r, cx=0, cy=0)=>
	[Math.cos(PI/180*deg)*r+cx,
	 Math.sin(PI/180*deg)*r+cy]

//---- jQuery utilities ------

const $win = $(window)

/**
 @param {JQWindowHandler} fn
*/const $load = fn=> $win.on({load:fn})

/**
 @param {string} elementId
*/const $byId = elementId=> $('#'+elementId)

/**
 @param {string} events
*/const $off = events=> $win.off(underscoreToSp(events))

/**
 @param {string} ns
 @param {{[event:string]:(e:JQuery.TriggeredEvent)=> unknown}} cfg
*/const $onNS = (ns,cfg)=> {
	entries(cfg).forEach(([ev,fn])=> {
		ev = ev.trim().replace(/[_\s]+|$/g,`${ns}\x20`)
		$win.off(ev).on(ev,fn)
	})
	return $win
}

/**
 @param {string}   events
 @param {Function} handler
 @param {boolean} [force]
*/jQuery.fn.offon = function(events, handler, force) {
	return (force === false)
		? $(this).off(events)
    	: $(this).off(events).on({[events]:handler})
}