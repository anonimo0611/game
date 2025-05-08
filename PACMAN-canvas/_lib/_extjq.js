'use strrict'
/** @param {string} elementId */
const $byId = elementId=> $('#'+elementId)

/** @param {Function} fn */
const $load = fn=> $(window).on({load:fn})

/** @param {string} ns */
const $onNS = (ns,cfg)=> {
	isObj(cfg) && entries(cfg).forEach(([ev,fn])=> {
		ev = String(ev).trim().replace(/[_\s]+|$/g,`${ns}\x20`)
		$off(ev).on(ev,fn)
	})
	return $(window)
}

/** @param {string} event */
const $off = event=> $(window).off(event)

/** @param {Function} fn */
const $ready = fn=> $(document).on({DOMContentLoaded:fn})

/**
 * @param {string} event
 * @param {*} [data]
 */
const $trigger = (event,data)=> $(window).trigger(event, data)

/**
 * @param {string}   arg
 * @param {Function} [fn]

 * @overload
 * @param   {string} arg
 * @param   {Function} fn
 * @returns {JQuery<window>}

 * @overload
 * @param   {Object.<string,Function>} arg
 * @returns {JQuery<window>}
 */
const $on = (arg, fn)=> {
	const rep = arg=> isStr(arg)?arg.trim().replace(/_/g,' '):arg
	typeof(arg) != 'object'
		? $(this).on(rep(arg),fn)
		: entries(arg).forEach(([ev,fn])=>$(this).on(rep(ev),fn))
	return $(this)
}