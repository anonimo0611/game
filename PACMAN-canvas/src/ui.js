export const Form   = document.forms[0]
export const powChk = reqInput('#powEnabled')
export const lives  = reqInput('#initialLives')

{// Set grid lines
	Grid.beginPath()
	for(let x=1; x<COLS; x++) Grid.setLinePath([T*x, 0],[T*x, BH])
	for(let y=0; y<ROWS; y++) Grid.setLinePath([0, T*y],[BW, T*y])
	Grid.strokeStyle = Color.GridLine
	Grid.stroke()
}

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
	(toObj(btnIds.map(id=> [id,reqButton(`#${id}Btn`)])))

//---- Custom menus ----

import * as _Menu from '../_lib/menu.js'
export const Menu = freeze({
	Level:  new _Menu.DorpDown('LevelMenu'),
	Extend: new _Menu.Slide('ExtendMenu'),
})

//---- Level menu ----

import * as Fruits from './sprites/fruits.js'
{// Create a sprite sheet for menu icons
	const menu = Menu.Level.root
	const size = menu.offsetHeight
	const {ctx}= canvas2D(null, size*Fruits.MAX, size)
	for (let i=0; i<Fruits.MAX; i++)
		Fruits.draw(ctx, i, size, i*size + size/2)
	$(menu).css('--url',`url("${ctx.canvas.toDataURL()}")`)
}

//---- Panels ----

$('body').on('keydown pointerdown', e=> {
	if (e.key == 'Escape' || !e.target.closest('.panel-ui'))
		$('.panel-ui').removeClass('opened')
})
$('.panelBtn').on('keydown pointerdown', e=> {
	if (e.key && !isActionKey(e)) return
	const btn = reqButton(e.currentTarget)
	const opn = $(btn).hasClass('opened')
	$('.panel-ui.opened').toggleClass('opened')
	$(btn).add(btn.value).toggleClass('opened',!opn)
})