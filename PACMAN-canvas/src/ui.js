export const Form   = document.forms[0]
export const powChk = getInput('powEnabled')
export const lives  = getInput('initialLives')

//---- Fit to viewport ----

$win.on('resize', ()=> {
	const scale = min(
		innerWidth /Form.offsetWidth*.98,
		innerHeight/Form.offsetHeight)
	Form.style.scale = min(1, scale).toFixed(2)
})
.trigger('resize')

//---- Buttons ----

const btnIds = /**@type {const}*/
	(['clear','reset','start'])

export const btns =
	/**@type {{[K in btnIds[number]]:HTMLButtonElement}}*/
	(toObj(btnIds.map(id=> [id,requireElem(id+'Btn')])))

//---- Custom menus ----

import * as _Menu from '../_lib/menu.js'
export const Menu = freeze({
	Level:  new _Menu.DorpDown('LevelMenu'),
	Extend: new _Menu.Slide('ExtendMenu'),
})

//---- LevelMenu ----

import * as Fruits from './sprites/fruits.js'
{// Create a sprite sheet for menu icons
	const menu = Menu.Level.root
	const size = menu.offsetHeight
	const {ctx}= canvas2D(null, size*Fruits.MAX, size)
	for (let i=0; i<8; i++)
		Fruits.draw(ctx, i, size, i*size + size/2)
	$(menu).css('--url',`url("${ctx.canvas.toDataURL()}")`)
}

//---- Window focused ----

import {Ctrl} from './control.js'
export const WinState = function() {
	let f = 1
	$win.on('blur', ()=> {f=0,Ctrl.pause(!f)})
	$win.on('focus',()=> {f=1,Ctrl.pause(!f)})
	return {get isActive() {return !!f}}
}()

//---- Panels ----

$('body').on('keydown pointerdown', e=> {
	if (e.key == 'Escape' || !e.target.closest('.panel-ui'))
		$('.panel-ui').removeClass('opened')
})
$('.panelBtn').on('keydown pointerdown', e=> {
	if (e.key && !isActionKey(e)) return
	const button = e.currentTarget
	const tgtSel = button.dataset.target ?? ''
	const opened = button.classList.contains('opened')
	$('.panel-ui.opened').toggleClass('opened')
	$(button).add(tgtSel).toggleClass('opened',!opened)
})