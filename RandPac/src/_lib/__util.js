'use strict'
const {isArray}= Array;
const {assign,defineProperty,entries,freeze,fromEntries,hasOwn,keys,values}= Object;
const {abs,atan2,ceil,cos,floor,max,min,PI,random,round,sin,sqrt,trunc:int}= Math;

const typeOf  = arg=> String(Object.prototype.toString.call(arg).slice(8,-1));
const hasIter = arg=> arg !== null && Symbol.iterator in Object(arg);
const isBool  = arg=> arg === true || arg === false;
const isElm   = arg=> arg instanceof HTMLElement;
const isStr   = arg=> typeof(arg) === 'string';
const isNum   = arg=> typeof(arg) === 'number' && !isNaN(arg);
const isObj   = arg=> typeof(arg) === 'object' && arg !== null && !isArray(arg);
const isFun   = arg=> typeof(arg) === 'function';

const dRoot  = document.documentElement;
const dBody  = document.body;
const dqs    = sel=> document.querySelector(sel);
const dqsAll = sel=> document.querySelectorAll(sel);
const byId   = id => document.getElementById(id);
const byIds  = arg=> {
	if (!hasIter(arg)) return [];
	if (isStr(arg))
		arg = splitByBar(arg);
	const elms = [];
	for (const id of arg) {
		if (!byId(id))
			throw Error(`Element with ID '${id}' not found`);
		elms.push(byId(id));
	} return elms;
};
const integers = len=> [...Array(+len).keys()];
const range    = (start, end)  => [...Array(end+1).keys()].slice(start);
const between  = (n, min, max) => (n >= min && n <= max);
const clamp    = (n,_min,_max) => min(max(n,_min), _max);
const randInt  = (min, max)    => int(random() * (max-min+1) + min);
const toNumber = (arg, def=arg)=> !isNum(+arg) || !isNum(arg)
	&& !isStr(arg) || (String(arg).trim() === '') ? def : +arg;

const splitByBar  = arg=>
	isStr(arg) && (arg=arg.trim()) && arg.split('|') || [];

const compareDist = (a,b)=>
	(a.dist == b.dist)? (a.index-b.index):(a.dist-b.dist);

const collisionCircle = (o1, o2, r1, r2)=>
	(o1.x-o2.x)**2 + (o1.y-o2.y)**2 <= (r1+(r2 ?? r1))**2;

const getCircumPos = (d, r, cx, cy)=>
	[cos(PI/180*d)*r+cx,
	 sin(PI/180*d)*r+cy];

const isKeyboardEvent = e=>
	isObj(e) && typeOf(e.originalEvent || e) == 'KeyboardEvent';

const isCombinationKey = e=> isKeyboardEvent(e)
	&& (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey);

const paramFromCurrentURL = param=> {
	param = [...new URL(location.href).searchParams]
		.find(p=> RegExp(`^${param}$`,'i').test(p[0]))?.[1];
	return toNumber(param);
};
const setReadonlyProp = (obj, key, value)=>
	defineProperty(obj, key, {value, writable:false, configurable:true});

const deepFreeze = obj=> {
	function freeze(o) {
		if (isElm(o)) return o
		for(const key of Object.getOwnPropertyNames(o)) {
			const desc = Object.getOwnPropertyDescriptor(o, key);
			if (desc.get || desc.set) continue;
			if (o[key] && typeof o[key] === 'object') freeze(o[key]);
		} return Object.freeze(o);
	} return freeze(obj);
};