'use strrict'

/** @param {Function} fn */
const $ready = fn=> $(document).on({DOMContentLoaded:fn}) && $(window)

/** @param {Function} fn */
const $load = fn=> $(window).on({load:fn})

/** @param {string} elementId */
const $byId = elementId=> $('#'+elementId)

/**
 * @param {string} ns
 * @param   {Object.<string,Function>} cfg
 */
const $onNS = (ns,cfg)=> {
	entries(cfg).forEach(([ev,fn])=> {
		ev = ev.trim().replace(/[_\s]+|$/g,`${ns} `)
		$offon(ev,fn)
	})
	return $(window)
}

/** @param {string} event */
const $off = event=> $(window).off(event.trim().replace(/_/g,' '))

/**
 * @param {string} event
 * @param {Function} fn
*/
const $offon = (event,fn)=> $off(event) && $on(event, fn)

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