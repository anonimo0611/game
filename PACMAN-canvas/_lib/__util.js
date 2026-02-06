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
    (stop:number): Generator<number,void,unknown>;
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
 @param {number}  v1
 @param {number} [v2]
 @param {number} [step]
 @type {{
    (stop:number): Generator<number,void,unknown>;
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
 @param {number} a start
 @param {number} b end
 @param {number} ratio 0.0-1.0
*/const lerp = (a,b,ratio)=> a + (b-a) * ratio

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
*/const clamp = (n,min=0,max=1)=> Math.min(Math.max(n,min), max)

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
 @param {Readonly<Position>} pos1
 @param {Readonly<Position>} pos2
 @param {number}  r1  radius1
 @param {number} [r2] radius2
*/const circleCollision = (pos1,pos2,r1,r2=r1)=>
	(pos1.x-pos2.x)**2 + (pos1.y-pos2.y)**2 <= (r1+r2)**2

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
 @param {JQWindowHandler} handler
*/const $load = handler=> $win.on({load:handler})

/**
 @param {string} elementId
*/const $byId = elementId=> $('#'+elementId)

/**
 @param {string} events
*/const $off = events=> $win.off(underscoreToSp(events))

/**
 @param {string} ns
 @param {JQWindowHandlers} events
*/const $onNS = (ns,events)=> $win.onNS(ns, events)

/**
 @param {string} ns
 @param {JQTriggerHandlers} events}
*/jQuery.fn.onNS = function(ns, events) {
    ns = ns[0] != '.' ? `.${ns}` : ns
    entries(events).forEach(([ev,fn])=> {
        const evNS = ev.trim().replace(/[_\s]+/g,`${ns}\x20`) + ns
        this.off(evNS).on(evNS,fn)
    })
    return this
}
/**
 @param {string}   events
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