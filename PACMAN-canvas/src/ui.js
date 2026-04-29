export const Form = document.forms[0]

//---- Inputs ----

const inputIds = /**@type {const}*/
	(['lvsRng','spdRng','onlChk','chsChk','unrChk','invChk',
	  'tgtChk','pthChk','grdChk','powChk','volRng','volRg2'])

export const inputs =
	/**@type {{[K in inputIds[number]]:HTMLInputElement}}*/
	(fromEntries(inputIds.map(id=> [id,requireElem(id)])))

//---- Buttons ----

const buttonIds = /**@type {const}*/
	(['clear','reset','start','demo','cs1','cs2','cs3'])

export const btns =
	/**@type {{[K in buttonIds[number]]:HTMLButtonElement}}*/
	(fromEntries(buttonIds.map(id=> [id,requireElem(id+'Btn')])))

/** @type {NodeListOf<HTMLButtonElement>} */
export const demoBtns = document.querySelectorAll('button.demo')

//---- Custom menus ----

import * as _Menu from '../_lib/menu.js'
export const Menu = freeze({
	Level:  new _Menu.DorpDown('LevelMenu'),
	Extend: new _Menu.Slide('ExtendMenu'),
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
	Form.style.scale = min(
		innerWidth /Form.offsetWidth*.98,
		innerHeight/Form.offsetHeight
	).toFixed(2)
})
.trigger('resize')

//---- Panels ----

$('.panelBtn').on('keydown pointerdown', e=> {
	if (e.key && !isEnterKey(e)) return
	const button = e.currentTarget
	const tgtSel = button.dataset.target ?? ''
	const opened = button.classList.contains('opened')
	e.stopPropagation()
	$('.panel-ui.opened').toggleClass('opened')
	$(button).add(tgtSel).toggleClass('opened',!opened)
})
$('body').on('keydown pointerdown', e=> {
	if (e.key == 'Escape' || !e.target.closest('.panel-ui'))
		$('.panel-ui').removeClass('opened')
})