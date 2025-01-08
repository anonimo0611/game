'use strict'
$.fn.offon = function(type, ...args) {
	return $(this).off(type).on(type, ...args)
}
$.fn.opacity = function(a, ms) {
	return !arguments.length
	? $(this)
		.css('opacity')
	: $(this)
		.css('opacity', +a)
		.css('transition', isNum(ms)? `opacity ${ms}ms`:null)
}
'on|off|offon|one|trigger|ready'.split('|').forEach(m=> {
	window['$'+m]= (...a)=> $(window)[m](...a)
	Object.defineProperty(window,'$'+m,{writable:false})
})
const $byId = id=> $('#'+id)
const $load = fn=> $(window).one('load',fn)
const $evNS = (ev,ns)=> String(ev).trim().replace(/(\s+)|$/g,`${ns??''}$1`)