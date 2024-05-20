'use strict'
const {isArray}= Array;
const {assign,defineProperty,entries,freeze,fromEntries,hasOwn,keys,values}= Object;
const {abs,atan2,ceil,cos,floor,max,min,PI,random,round,sign,sin,sqrt,trunc:int}= Math;

const typeOf   = arg=> String(Object.prototype.toString.call(arg).slice(8,-1));
const integers = len=> [...Array(+len).keys()];
const hasIter  = arg=> arg !== null && Symbol.iterator in Object(arg);
const isBool   = arg=> arg === true || arg === false;
const isElm    = arg=> arg instanceof HTMLElement;
const isObj    = arg=> typeof(arg) === 'object' && !isArray(arg);
const isStr    = arg=> typeof(arg) === 'string';
const isFun    = arg=> typeof(arg) === 'function';
const isNum    = arg=> typeof(arg) === 'number' && !isNaN(arg);

const dRoot  = document.documentElement;
const dBody  = document.body;
const dqs    = sel=> document.querySelector(sel);
const dqsAll = sel=> document.querySelectorAll(sel);
const byId   = id => document.getElementById(id);

const between    = (n, min, max) => (n >= min && n <= max);
const clamp      = (n,_min,_max) => min(max(n,_min), _max);
const randInt    = (min, max=min)=> int(random() * (max-min+1) + min);
const randFloat  = (min, max=min)=> random() * (max-min) + min;
const randChoice = (arg)         => isArray(arg) ? arg[randInt(0, arg.length-1)] : [];
const toNumber   = (arg, def=arg)=> !isNum(+arg) || !isNum(arg)
	&& !isStr(arg) || String(arg).trim() === '' ? def : +arg;