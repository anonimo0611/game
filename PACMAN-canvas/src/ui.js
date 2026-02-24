//---- Inputs ----

/** @typedef {typeof inputIds[number]} InputIds */
const inputIds = /**@type {const}*/
	(['lvsRng','spdRng','onlChk','chsChk','unrChk',
	  'invChk','tgtChk','grdChk','powChk','volRng','volRg2'])

export const inputs =
	/**@type {{[K in InputIds]:HTMLInputElement}}*/
	(fromEntries(inputIds.map(id=>[id,requireElem(id)])))

//---- Buttons ----

/** @typedef {typeof buttonIds[number]} ButtonIds */
const buttonIds = /**@type {const}*/
	(['clear','reset','start','demo','coff1','coff2','coff3'])

export const btns =
	/**@type {{[K in ButtonIds]:HTMLButtonElement}}*/
	(fromEntries(buttonIds.map(id=>[id,requireElem(id+'Btn')])))

//---- Menus ----

import * as _Menu from '../_lib/menu.js'
export const Menu = freeze({
	Level: new _Menu.DorpDown('LevelMenu'),
	Extend:new _Menu.Slide('ExtendMenu'),
})

//---- Focus ----

import {Ctrl} from './control.js'
export const WinState = function() {
	let f = 1
	$win.on('blur', ()=> {f=0,Ctrl.pause(!f)})
	$win.on('focus',()=> {f=1,Ctrl.pause(!f)})
	return {get active() {return !!f}}
}()

//---- Panels ----

;/**@type {HTMLButtonElement[]}*/
($('.panelBtn').get()).forEach(btn=> {
	$(btn).on('keydown pointerdown', e=> {
		if (e.key && !isEnterKey(e))
			return
		$('.panel').toggle()
		$(btn).toggleClass('opened')
	})
	$('body').on('keydown pointerdown', e=> {
		if (!btn.offsetParent
		 || e.target == btn
		 || qS(btn.value)?.contains(e.target))
			return
		$(btn.value).hide()
		$(btn).removeClass('opened')
	})
})