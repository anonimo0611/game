import * as Menus  from '../_lib/menu.js'
import * as Fruits from './sprites/fruits.js'

//---- Form controls ----

export const Form   = document.forms[0]
export const lives  = reqInput('#initialLives')
export const powChk = reqInput('#powEnabled')
export const Btns   = freeze({
	clear: reqButton('#clearBtn'),
	reset: reqButton('#resetBtn'),
	start: reqButton('#startBtn'),
})

//---- Custom menus ----

export const Menu = freeze({
	Level:  new Menus.DorpDown('LevelMenu'),
	Extend: new Menus.Slide('ExtendMenu'),
})
{// Create a SpriteSheet for Level menu icons
	const menu = $(Menu.Level.root)
	const size = menu[0].offsetHeight
	const {ctx}= canvas2D(null, size*Fruits.MAX, size)
	for (let i=0; i<Fruits.MAX; i++)
		Fruits.draw(ctx, i, size, i*size + size/2)
	menu.css('--url',`url("${ctx.canvas.toDataURL()}")`)
}

//---- Grid lines ----

Grid.beginPath()
for(let x=T; x<BW; x+=T) Grid.setLinePath([x,0],[x,BH])
for(let y=0; y<BH; y+=T) Grid.setLinePath([0,y],[BW,y])
Grid.strokeStyle = Color.GridLine
Grid.stroke()

//---- Fit to viewport ----

$win.on('resize', ()=> {
	const {offsetWidth:w,offsetHeight:h}= Form
	const s = min(innerWidth/w*.98, innerHeight/h)
	Form.style.scale = min(1,s).toFixed(2)
})
.trigger('resize')

//---- Pop over ----

$('body').on('keydown pointerdown', e=> {
	if (e.key == 'Escape'
	|| !e.target.closest('.popover'))
		$('.popover').removeClass('opened')
})
$('button.popover').on('keydown pointerdown', e=> {
	if (e.key && !isActionKey(e)) return
	const btn = reqButton(e.currentTarget)
	const opn = $(btn).hasClass('opened')
	$('.popover.opened') .removeClass('opened')
	$(btn).add(btn.value).toggleClass('opened',!opn)
})