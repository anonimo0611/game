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

const integers = len=> [...Array(+len).keys()];
const between  = (n, min, max) => (n >= min && n <= max);
const clamp    = (n,_min,_max) => min(max(n,_min), _max);
const randInt  = (min, max)    => int(random() * (max-min+1) + min);
const toNumber = (arg, def=arg)=> !isNum(+arg) || !isNum(arg)
	&& !isStr(arg) || (String(arg).trim() === '') ? def : +arg;

const splitByBar  = arg=>
	isStr(arg) && (arg=arg.trim()) && arg.split('|') || [];

const getCircum   = (degree,r=1,{x:cx=0,y:cy=0}={})=> {
	const x = Math.cos(PI/180*degree) * r + cx
	const y = Math.sin(PI/180*degree) * r + cy
	return {pos:{x, y}, values:[x, y]}
}
const setReadonlyProp = (obj, key, value)=>
	defineProperty(obj, key, {value, writable:false, configurable:true});