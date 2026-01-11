/** @param {string} id */
function getInput(id) {
	let element = document.getElementById(id)
	if (element instanceof HTMLInputElement) return element
	throw TypeError(`There is no input element with the ID “${id}”.`)
}
/** @typedef {typeof inputIds[number]} InputIds */
const inputIds = /**@type {const}*/
	(['lvsRng','spdRng','onlChk','chsChk','unrChk',
	  'invChk','tgtChk','grdChk','powChk','volRng','volRg2'])

export const inputs =
	/**@type {{[key in InputIds]:HTMLInputElement}}*/
	(Object.fromEntries(inputIds.map(id=>[id,getInput(id)])))