'use strict'
const {isArray}= Array
const {assign,defineProperty,entries,freeze,getOwnPropertyNames,hasOwn,keys,values}= Object
const {abs,atan2,ceil,cos,floor,max,min,PI,random,round,sign,sin,sqrt,trunc:int}= Math

const typeOf   = arg=> String(Object.prototype.toString.call(arg).slice(8,-1))
const integers = len=> [...Array(+len).keys()]
const hasIter  = arg=> arg !== null && Symbol.iterator in Object(arg)
const isBool   = arg=> arg === true || arg === false
const isElm    = arg=> arg instanceof HTMLElement
const isObj    = arg=> typeof(arg) === 'object' && arg !== null && !isArray(arg);
const isStr    = arg=> typeof(arg) === 'string'
const isFun    = arg=> typeof(arg) === 'function'
const isNum    = arg=> typeof(arg) === 'number' && !isNaN(arg)

const dRoot  = document.documentElement
const dBody  = document.body
const dqs    = sel=> document.querySelector(sel)
const dqsAll = sel=> document.querySelectorAll(sel)
const byId   = id => document.getElementById(id)
const byIds  = arg=> {
	if (!hasIter(arg))
		return []
	if (isStr(arg))
		arg = [arg.trim().split('|')].flat()
	return [...arg].map(id=> {
		if (!byId(id))
			throw ReferenceError(`The element with id '${id}' not found`)
		return byId(id)
	});
}

const lerp       = (x, y, p)     => x + (y - x) * p
const norm       = (x, y, p)     => (p - x) / (y - x)
const toRadians  = (deglee)      => deglee * PI/180
const between    = (n, min, max) => (n >= min && n <= max)
const clamp      = (n, min, max) => Math.min(Math.max(n,min), max)
const randFloat  = (min, max)    => random() * (max-min) + min
const randInt    = (min, max)    => int(random() * (max-min+1) + min)
const getDist    = (v1={}, v2={})=> sqrt((v1.x-v2.x)**2 + (v1.y-v2.y)**2)
const toNumber   = (arg, def=NaN)=> !isNum(+arg) || !isNum(arg)
	&& !isStr(arg) || String(arg).trim() === '' ? def : +arg

const randChoice = (...args)=> {
	if (args.length == 1 && isArray(args[0])) args = args[0];
	return isArray(args) ? args[randInt(0, args.length-1)] : []
}
const splitByBar  = arg=>
	isStr(arg) && (arg=arg.trim()) && arg.split('|') || [];

const setReadonlyProp = (obj, key, val)=> {
	return defineProperty(obj, key, {value:val, writable:false, configurable:true})
}

const deepFreeze = obj=> {
	function freeze(o) {
		if (isElm(o)) return o
		for (const key of getOwnPropertyNames(o)) {
			const desc = Object.getOwnPropertyDescriptor(o, key)
			if (desc.get || desc.set) continue
			if (o[key] && typeof o[key] === 'object') freeze(o[key])
		} return Object.freeze(o)
	} return freeze(obj)
}
const getIntersection = (a, b, c, d)=> {
    const v = Vec2.cross(Vec2.sub(b,a), Vec2.sub(d,c))
    if (v == 0) {
		// Line segments are parallel
        return null
    }
    const s = Vec2.cross(Vec2.sub(c,a), Vec2.sub(d,c)) / v
    const t = Vec2.cross(Vec2.sub(b,a), Vec2.sub(a,c)) / v
    if (s < 0 || 1 < s || t < 0 || 1 < t) {
        // Line segments do not intersect
        return null
    }
    return vec2(
    	a.x + s * Vec2.sub(b,a).x,
    	a.y + s * Vec2.sub(b,a).y
    )
}