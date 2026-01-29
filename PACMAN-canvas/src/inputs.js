function getCtrl(/**@type {string}*/id) {
	let elem = document.getElementById(id)
	if (elem instanceof HTMLInputElement
	 || elem instanceof HTMLButtonElement) return elem
	throw TypeError(`There is no input/button element with the ID “${id}”.`)
}
/** @typedef {typeof inputIds[number]} InputIds */
const inputIds = /**@type {const}*/
	(['lvsRng','spdRng','onlChk','chsChk','unrChk',
	  'invChk','tgtChk','grdChk','powChk','volRng','volRg2'])

/** @typedef {typeof buttonIds[number]} ButtonIds */
const buttonIds = /**@type {const}*/
	(['clear','reset','start','demo','coff1','coff2','coff3'])

export const inputs =
	/**@type {{[key in InputIds]:HTMLInputElement}}*/
	(fromEntries(inputIds.map(id=>[id,getCtrl(id)])))

export const btns =
	/**@type {{[key in ButtonIds]:HTMLButtonElement}}*/
	(fromEntries(buttonIds.map(id=>[id,getCtrl(id+'Btn')])))