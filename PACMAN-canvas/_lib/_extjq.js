'use strict'
$.fn.offon = function(type, ...args) {
	return $(this).off(type).on(type, ...args)
}
$.fn.opacity = function(a, ms) {
	return !arguments.length
	? $(this).css('opacity')
	: $(this).css({opacity:+a,transition:isNum(ms)?`opacity ${ms}ms`:null})
}
const [$ready,$one,$on,$off,$offon,$trigger]= function() {
	return ['ready','one','on','off','offon','trigger']
		.map(f=> (...args)=> $(window)[f](...args))
}()
const $byId = (id)=> $('#'+id)
const $load = (fn)=> $(window).one('load',fn)
const $onNS = (ns,ev,fn)=> $on(String(ev).trim().replace(/(\s+)|$/g,`${ns}$1`),fn)