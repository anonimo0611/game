import {Dir}      from '../_lib/direction.js'
import {DorpDown} from '../_lib/menu.js'
import {Ghost}    from './actor.js'
import {T,S}      from './_constants.js'
import {ghost}    from './_constants.js'
import {resize}   from './_constants.js'
import PacSprite  from '../src/sprites/pacman.js'

export const {ctx}= canvas2D('previewCvs')

const getOrient = ()=> /**@type {Direction}*/
(
	$('input[name=orient]:checked').attr('value')
)

const Type = /**@type {const}*/
({
	Actor: {None: -1, Pacman:0, Akabei:1, Pinky:2, Aosuke:3, Guzuta:4, Fright:5},
	Pacman:{Normal:0, Losing:1},
	Ghost: {Normal:0, Mended:1, Exposed:2, Flashed:3}
})

class Data
{
	/**
	 * @param {{
	 * type?:    number,
	 * subType?: number,
	 * pacman?:  PacSprite,
	 * ghost?:   Ghost}} param
	 */
	constructor({type,subType,pacman,ghost}={})
	{
		this.aIdx    = 0
		this.fIdx    = 1
		this.orient  = /**@type {Direction}*/(L)
		this.pacman  = pacman
		this.ghost   = ghost
		this.type    = type ?? -1
		this.subType = subType ?? -1
	}
}

{ // Preview
	let   data  = new Data()
	const Menu  = new DorpDown('animMenu')
	const $btns = $('.radioButtons input')

	function change(isLoop=false)
	{
		!isLoop && Timer.cancelAll()
		const [type,subType]= Menu.value.split(':').map(Number)
		switch(type) {
			case Type.Actor.Pacman:
			{
				const pacman = new PacSprite(ctx)
				data = new Data({type,subType,pacman})
				if (setCtrl({disabled:subType==Type.Pacman.Losing}))
				{
					data.pacman?.setLosing()
					Timer.set(2200, ()=> change(true), {key:'Losing'})
				}
				break
			}
			case Type.Actor.Akabei:
			case Type.Actor.Pinky:
			case Type.Actor.Aosuke:
			case Type.Actor.Guzuta:
			{
				const ghost = new Ghost(S)
				data = new Data({type,subType,ghost})
				setCtrl({disabled:subType != Type.Ghost.Normal})
				break
			}
			case Type.Actor.Fright:
			{
				const ghost = new Ghost(S)
				data = new Data({type,subType,ghost})
				setCtrl({disabled:true})
				break
			}
			case Type.Actor.None:
				data = new Data()
				Timer.cancelAll()
				setCtrl({disabled:true})
		}
	}
	function setCtrl({disabled=false}={})
	{
		$btns.prop({disabled})
		if (!disabled)
			data.orient = getOrient()
		return disabled
	}
	function drawPacman()
	{
		ctx.save()
		ctx.translate(S*1.5/2, S/2)
		ctx.scale(T/TileSize, T/TileSize)
		data.pacman?.draw({orient:data.orient, radius:PacScale*TileSize})
		ctx.restore()
	}
	function drawGhost()
	{
		ctx.save()
		data.subType == Type.Ghost.Exposed
			? ctx.translate(S/3.3, T/2)
			: ctx.translate(S/2.0, T/2)

		data.ghost?.sprite.draw({
			...ghost,
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
		if (data.type >= 0) {
			data.aIdx ^= +(Ticker.count %  6 == 0)
			data.fIdx ^= +(Ticker.count % 14 == 0)
			data.pacman?.update()
		}
	}
	function draw()
	{
		ctx.clear()
		if (data.type >= 0) {
			data.type == Type.Actor.Pacman
				? drawPacman()
				: drawGhost()
		}
	}

	Menu.on({change})
	Menu.$root.on('keydown', e=>
	{
		const dir = Dir.from(e)
		if (dir)
		{
			const len  = $btns.length
			const idx  = +$btns.filter(':enabled:checked').data('idx')
			const dirX = Vec2[dir].x
			if (!Menu.closed || !dirX || isNaN(idx))
				return
			$btns.eq((dirX+idx+len) % len)
				.prop({checked:true})
				.trigger('change')
		}
	})
	$btns.on('change', e=>
	{
		data.orient = /**@type {Direction}*/
		(
			e.target.getAttribute('value')
		)
	})
	Ticker.set(update, draw)
}