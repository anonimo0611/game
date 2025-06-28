import PacSprite    from '../src/sprites/pacman.js'
import {Dir}        from '../_lib/direction.js'
import {DorpDown}   from '../_lib/menu.js'
import {ghsSprite}  from './_constants.js'
import {T,S,resize} from './_constants.js'

export const {ctx}= canvas2D('previewCvs')

const Menu = new DorpDown('animMenu')
const Btns = $('.radioButtons input')

const Type = /**@type {const}*/
({
	Actor: {None: -1, Pacman:0, Akabei:1, Pinky:2, Aosuke:3, Guzuta:4, Fright:5},
	Pacman:{Normal:0, Losing:1},
	Ghost: {Normal:0, Mended:1, Exposed:2, Flashed:3}
})

class AnimData
{
	constructor(type=0,subType=0)
	{
		this.aIdx    = 0
		this.fIdx    = 0
		this.type    = type
		this.subType = subType
		this.ghost   = ghsSprite
		this.pacman  = new PacSprite(ctx)
		this.orient  = /**@type {Direction}*/(L)
	}
}

{// Preview
	let data = /** @type {?AnimData} */(null)

	function change()
	{
		Timer.cancel('Losing')
		const [type,subType]= Menu.value.split(':').map(Number)

		switch (type) {
		case Type.Actor.None:
			data = null
			btnDisabled(true)
			break

		case Type.Actor.Pacman:
			data = new AnimData(type,subType)
			if (btnDisabled(subType == Type.Pacman.Losing))
			{
				data.pacman.setLosing()
				Timer.set(2200, change, {key:'Losing'})
			}
			break

		case Type.Actor.Akabei:
		case Type.Actor.Pinky:
		case Type.Actor.Aosuke:
		case Type.Actor.Guzuta:
		case Type.Actor.Fright:
			data = new AnimData(type,subType)
			btnDisabled(
				Type.Actor.Fright == type ||
				Type.Ghost.Normal != subType
			)
			break
		}
	}
	function btnDisabled(disabled=false)
	{
		Btns.prop({disabled})
		if (!disabled && data)
			data.orient = /**@type {Direction}*/(
				$('input[name=orient]:checked').attr('value')
			)
		return disabled
	}
	function drawPacman()
	{
		ctx.save()
		ctx.translate(S*1.5/2, S/2)
		ctx.scale(T/TileSize, T/TileSize)
		data?.pacman.draw({orient:data.orient, radius:PacScale*TileSize})
		ctx.restore()
	}
	function drawGhost()
	{
		ctx.save()
		data?.subType == Type.Ghost.Exposed
			? ctx.translate(S/3.3, T/2)
			: ctx.translate(S/2.0, T/2)

		data?.ghost.draw({
			size:      S,
			mainCtx:   ctx,
			color:     Color[GhsNames[data.type-1]],
			aIdx:      data.aIdx,
			orient:    data.orient,
			spriteIdx: data.subType == Type.Ghost.Flashed ? data.fIdx:0,
			isFright:  data.type    == Type.Actor.Fright,
			isExposed: data.subType == Type.Ghost.Exposed,
			isMended:  data.subType == Type.Ghost.Mended,
		})
		ctx.restore()
	}
	function update()
	{
		resize()
		if (data) {
			data.aIdx ^= +(Ticker.count %  6 == 0)
			data.fIdx ^= +(Ticker.count % 14 == 1)
			data.pacman?.update()
		}
	}
	function draw()
	{
		ctx.clear()
		if (data) {
			data.type == Type.Actor.Pacman
				? drawPacman()
				: drawGhost()
		}
	}

	Menu.$root
	.on({change})
	.on('keydown', e=>
	{
		const dir = Dir.from(e)
		if (!dir) return

		const vx  = Vec2[dir].x
		const len = +Btns.length
		const idx = +Btns.filter(':enabled:checked').data('idx')
		Menu.closed
		&& vx
		&& isFinite(idx)
		&& Btns
			.eq((vx+idx+len) % len)
			.prop({checked:true})
			.trigger('change')
	})
	Btns.on('change', e=>
	{
		if (!data) return
		data.orient = /**@type {Direction}*/(
			e.target.getAttribute('value')
		)
	})

	Ticker.set(update, draw)
}