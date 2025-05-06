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
const [$ready,$on,$off,$trigger]=(()=> {
	const rep = arg=> isStr(arg)?arg.trim().replace(/_/g,' '):arg
	return['ready','on','off','trigger'].map(f=> (...a)=>{
		!isObj(a[0])
			? $(this)[f](rep(a[0]),...a.slice(1))
			: entries(a[0]).forEach(([k,v])=>$(this)[f](rep(k),v))
		return $(this)
	})
})()