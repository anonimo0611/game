'use strict'
$.fn.offon = function(type, ...args) {
	return $(this).off(type).on(type, ...args)
}
$.fn.opacity = function(a, ms) {
	return !arguments.length
		? $(this).css('opacity')
		: $(this).css({opacity:+a,transition:isNum(ms)?`opacity ${ms}ms`:null})
}
const $byId = id=> $('#'+id)
const $load = fn=> $(window).one('load',fn)
const $onNS = (ns,cfg)=> {
	isObj(cfg) && entries(cfg).forEach(([ev,fn])=>
		$on(String(ev).trim().replace(/[_\s]+|$/g,`${ns}\x20`),fn))
	return $(window)
}
const [$ready,$one,$on,$off,$offon,$trigger]= function() {
	const rep = arg=> isStr(arg)? arg.trim().replace(/_/g,'\x20'):arg
	return 'ready|one|on|off|offon|trigger'.split('|').map(f=> (...a)=> {
		if (!isObj(a[0])) return $(window)[f](rep(a[0]),...a.slice(1))
		entries(a[0]).forEach(([k,v])=> $(window)[f](rep(k),v))
		return $(window)
	})
}()