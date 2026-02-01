'use strict'
const {fromEntries,defineProperty,entries,freeze,hasOwn,keys,values}= Object
const {abs,ceil,floor,max,min,PI,random,round,sin,sqrt,trunc:int}= Math

/**
 @template {object} T
 @param {T} o
 @returns {Readonly<(keyof T)[]>}
*/const typedKeys = o=> /**@type {(keyof T)[]}*/(keys(o))

/**
 @template {object} T
 @param {T} o
 @returns {[keyof T, T[keyof T]][]}
*/const typedEntries = o=> /**@type {any}*/(entries(o))

/**
 @param {KeyboardEvent|JQuery.KeyboardEventBase} e
*/const keyRepeat = e=>
	(e instanceof KeyboardEvent? e : e.originalEvent)?.repeat ?? false

/**
 @param {KeyboardEvent|JQuery.KeyboardEventBase} e
*/const isCombiKey = e=> (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)

/**
 @param {KeyboardEvent|JQuery.KeyboardEventBase|JQuery.TriggeredEvent} e
*/const isEnterKey = e=> (e.key === '\x20' || e.key === 'Enter')

/**
 @param {number}  v1
 @param {number} [v2]
 @param {number} [step]
 @type {{
    (stop:number): Generator<number, void, unknown>;
    (start:number, stop:number, step?:number|undefined): Generator<number,void,unknown>;
 }}
*/const range = function*(v1,v2,step=1) {
	const [start,stop]= (v2 === undefined ? [0,v1]:[v1,v2])
	if (!arguments.length) throw TypeError('Range expected at least 1 argument, got 0')
	if (step === 0) throw RangeError('The 3rd argument must not be zero')
    if (step > 0) for (let i=start; i<stop; i+=step) yield i
    if (step < 0) for (let i=start; i>stop; i+=step) yield i
}

/**
 @param {number} v1
 @param {number} [v2]
 @param {number} [step]
 @type {{
    (stop:number): Generator<number, void, unknown>;
    (start:number, stop:number, step?:number|undefined): Generator<number,void,unknown>;
 }}
*/const cycleRange = function*(v1,v2,step=1) {
	const [start,stop]= (v2 === undefined ? [0,v1]:[v1,v2])
    if (step > 0 && start >= stop) return
    if (step < 0 && start <= stop) return
	while(1) yield* v2 === undefined ? range(v1) : range(v1,v2,step)
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
 @typedef {{dist:number, idx:number}} DistEntry
 @type {(a:Readonly<DistEntry>, b:Readonly<DistEntry>)=> number}
*/const compareDist = (a,b)=> a.dist-b.dist || a.idx-b.idx

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
 @template T
 @param {string} str
 @param {Iterable<T>} iterable
*/const trMap = (str,iterable)=> {
    const map = /**@type {Map<String,T>}*/(new Map)
    const itr = iterable[Symbol.iterator]()
    for(const char of str) {
        const {value,done}= itr.next()
        if (done) break
		map.set(char,value)
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
 @param {{[event:string]:(e:JQuery.TriggeredEvent)=> void}} events
*/const $onNS = (ns,events)=> {
	entries(events).forEach(([ev,fn])=> {
		ns = ns[0] != '.' ? `.${ns}` : ns
		ev = ev.trim().replace(/[_\s]+/g,`${ns}\x20`) + ns
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
/**
 @param {(ev:WheelEvent)=> void} handler
*/jQuery.fn.onWheel = function(handler) {
	return this.each(function() {
		this.addEventListener('wheel', handler, {passive:false})
	})
}