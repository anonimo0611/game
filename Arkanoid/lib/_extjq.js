$.fn.opacity = function(a, ms) {
	return !arguments.length
		? $(this).css('opacity')
		: $(this).css('transition',
			$.isNumeric(ms) ? `opacity ${ms}ms` : null).css('opacity', +a)
}
$.fn.offon = function(type, ...args) {
	$(this).off(type).on(type, ...args)
}
const $on      = (...a)=> $(window).on     (...a);
const $off     = (...a)=> $(window).off    (...a);
const $offon   = (...a)=> $(window).offon  (...a);
const $one     = (...a)=> $(window).one    (...a);
const $trigger = (...a)=> $(window).trigger(...a);
const $load    = (func)=> $(window).on('load',func);
const $ready   = (func)=> $(window).ready(func);
Object.assign(HTMLElement.prototype, {
	on     (...a) {return $(this).on     (...a)[0]},
	off    (...a) {return $(this).off    (...a)[0]},
	offon  (...a) {return $(this).offon  (...a)[0]},
	one    (...a) {return $(this).one    (...a)[0]},
	trigger(...a) {return $(this).trigger(...a)[0]},
});