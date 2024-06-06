'use strict'
const {isArray}= Array
const {assign,defineProperty,entries,freeze,getOwnPropertyNames,hasOwn,keys,values}= Object
const {abs,atan2,ceil,cos,floor,max,min,PI,random,round,sign,sin,sqrt,trunc:int}= Math

const typeOf   = arg=> String(Object.prototype.toString.call(arg).slice(8,-1))
const integers = len=> [...Array(+len).keys()]
const hasIter  = arg=> arg !== null && Symbol.iterator in Object(arg)
const isBool   = arg=> arg === true || arg === false
const isElm    = arg=> arg instanceof HTMLElement
const isObj    = arg=> typeof(arg) === 'object' && !isArray(arg)
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

const makeDiv = (selector='')=> makeElm(`div${selector}`)
const makeElm = (selector='')=> { // The attribute value should be alphanumerical
	if (!isStr(selector)) throw TypeError(`'${selector}' is not a string`)
	if (!/^\s*[\w-]+/.test(selector)) throw SyntaxError('Element type is invalid')
	const atRE  = /\[([a-z][a-z\d_-]+)=[\x27\x22]?([^#\.\[\]\x27\x22]+?)[\x27\x22]?\]/i
	const cElm  = document.createElement(selector.trim().match(/^[\w-]+/)[0])
	const ids   = selector.match(/#[a-z][a-z\d_-]+/gi)
	const cls   = selector.match(/(\.[^#\.\[\]]+)+/gi)?.join('')
	const attrs = selector.match(RegExp(atRE,'gi')) || []
	if (ids) cElm.id = ids.at(-1).slice(1)
	if (cls) cElm.className = cls.split('.').join('\x20').trim()
	attrs.forEach(attr=> cElm.setAttribute(...atRE.exec(attr).slice(1)))
	return cElm
}
const collisionRect = (a, b)=> {
	if (!isObj(a) || !isObj(b)) return false;
	const ax = a.Pos?.x - (a.Radius ?? 0);
	const ay = a.Pos?.y - (a.Radius ?? 0);
	const bx = b.Pos?.x - (b.Radius ?? 0);
	const by = b.Pos?.y - (b.Radius ?? 0);
	return (
		abs((ax+a.Width /2)-(bx+b.Width /2)) < (a.Width +b.Width) /2 &&
		abs((ay+a.Height/2)-(by+b.Height/2)) < (a.Height+b.Height)/2);
}
const getIntersection = (a, b, c, d)=> {
    let deno = Vec2.cross(Vec2.sub(b,a), Vec2.sub(d, c));
    if (deno == 0.0) {
		// Line segments are parallel
        return null;
    }
    let s = Vec2.cross(Vec2.sub(c,a), Vec2.sub(d,c)) / deno;
    let t = Vec2.cross(Vec2.sub(b,a), Vec2.sub(a,c)) / deno;
    if (s < 0.0 || 1.0 < s || t < 0.0 || 1.0 < t) {
        // Line segments do not intersect
        return null;
    }
    return vec2(
    	a.x + s * Vec2.sub(b,a).x,
    	a.y + s * Vec2.sub(b,a).y
    );
}
const isIntersectionBetween2Points = (v1st, v1ed, v2st, v2ed)=> {
	const [v1ed_v1st,v2ed_v2st]=[Vec2.sub(v1ed,v1st),Vec2.sub(v2ed,v2st)];
	const [v2st_v1ed,v2ed_v1ed]=[Vec2.sub(v2st,v1ed),Vec2.sub(v2ed,v1ed)];
	const [v1st_v2st,v1ed_v2st]=[Vec2.sub(v1st,v2st),Vec2.sub(v1ed,v2st)];
	return (
		Vec2.cross(v1ed_v1st,v2st_v1ed) * Vec2.cross(v1ed_v1st,v2ed_v1ed) < 0.000001 &&
		Vec2.cross(v2ed_v2st,v1st_v2st) * Vec2.cross(v2ed_v2st,v1ed_v2st) < 0.000001
	);
}
