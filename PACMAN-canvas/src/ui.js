export const Form = document.forms[0]

//---- Inputs ----

const inputIds = /**@type {const}*/
	(['lvsRng','spdRng','onlChk','chsChk','unrChk','invChk',
	  'tgtChk','pthChk','grdChk','powChk','volRng','volRg2'])

export const inputs =
	/**@type {{[K in inputIds[number]]:HTMLInputElement}}*/
	(fromEntries(inputIds.map(id=>[id,requireElem(id)])))

//---- Buttons ----

const buttonIds = /**@type {const}*/
	(['clear','reset','start','demo','coff1','coff2','coff3'])

export const btns =
	/**@type {{[K in buttonIds[number]]:HTMLButtonElement}}*/
	(fromEntries(buttonIds.map(id=>[id,requireElem(id+'Btn')])))

//---- Custom menus ----

import * as _Menu from '../_lib/menu.js'
export const Menu = freeze({
	Level: new _Menu.DorpDown('LevelMenu'),
	Extend:new _Menu.Slide('ExtendMenu'),
})

//---- Window focused ----

import {Ctrl} from './control.js'
export const WinState = function() {
	let f = 1
	$win.on('blur', ()=> {f=0,Ctrl.pause(!f)})
	$win.on('focus',()=> {f=1,Ctrl.pause(!f)})
	return {get isActive() {return !!f}}
}()

//---- Fit to viewport ----

$win.on('resize', ()=> {
	const scale = min(
		innerWidth /Form.offsetWidth*.98,
		innerHeight/Form.offsetHeight)
	Form.style.scale = min(1, scale).toFixed(2)
})
.trigger('resize')

//---- Panels ----

;/** @type {HTMLButtonElement[]} */
($('.panelBtn').get()).forEach(btn=> {
	$(btn).on('keydown pointerdown', e=> {
		if (e.key && !isEnterKey(e)) return
		$('.panel').toggle()
		$(btn).toggleClass('opened')
	})
	$('body').on('keydown pointerdown', e=> {
		const t = e.target, id = btn.value
		if (t == btn || qS(id)?.contains(t)) return
		$(id).hide() && $(btn).removeClass('opened')
	})
})