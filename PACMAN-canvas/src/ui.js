import * as Menus  from '../_lib/menu.js'
import * as Fruits from './sprites/fruits.js'

export const Form   = document.forms[0]
export const powChk = reqInput('#powEnabled')
export const lives  = reqInput('#initialLives')

//---- Fit to viewport ----

$win.on('resize', ()=> {
	const {offsetWidth:w,offsetHeight:h}= Form
	const s = min(innerWidth/w*.98, innerHeight/h)
	Form.style.scale = min(1,s).toFixed(2)
})
.trigger('resize')

//---- Pop over ----

$('body').on('keydown pointerdown', e=> {
	if (e.key == 'Escape' || !e.target.closest('.popover'))
		$('.popover').removeClass('opened')
})
$('button.popover').on('keydown pointerdown', e=> {
	if (e.key && !isActionKey(e)) return
	const btn = reqButton(e.currentTarget)
	const opn = $(btn).hasClass('opened')
	$('.popover.opened') .removeClass('opened')
	$(btn).add(btn.value).toggleClass('opened',!opn)
})
.on('focus', function() {
	const p = $('.popover.opened').get(0)
	p && p != this && $(this).trigger('pointerdown')
})

//---- Grid lines ----

Grid.beginPath()
for(let x=1; x<COLS; x++) Grid.setLinePath([T*x, 0],[T*x, BH])
for(let y=0; y<ROWS; y++) Grid.setLinePath([0, T*y],[BW, T*y])
Grid.strokeStyle = Color.GridLine
Grid.stroke()

//---- Buttons ----

export const Btns = function() {
	const ids = /**@type {const}*/(['clear','reset','start'])
	return /**@type {{[K in ids[number]]:HTMLButtonElement}}*/(
		toObj(ids.map(id=> [id,reqButton(`#${id}Btn`)]))
	)
}()

//---- Custom Menus ----

export const Menu = freeze({
	Level:  new Menus.DorpDown('LevelMenu'),
	Extend: new Menus.Slide('ExtendMenu'),
})
{// Create a SpriteSheet for Level menu icons
	const menu = Menu.Level.root
	const size = menu.offsetHeight
	const {ctx}= canvas2D(null, size*Fruits.MAX, size)
	for (let i=0; i<Fruits.MAX; i++)
		Fruits.draw(ctx, i, size, i*size + size/2)
	$(menu).css('--url',`url("${ctx.canvas.toDataURL()}")`)
}