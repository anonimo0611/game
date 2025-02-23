import * as Menu   from '../_lib/menu.js'
import {Ticker}    from '../_lib/timer.js'
import {Timer}     from '../_lib/timer.js'
import {Vec2}      from '../_lib/vec2.js'
import {Dir}       from '../_lib/direction.js'
import PacSprite   from '../src/pacman/pac_sprite.js'
import {Ghost}     from './actor.js'
import {T,S,ghost} from './_constants.js'
import {PacScale,TileSize} from '../src/_constants.js'
export const {cvs:pvCvs}= canvas2D('previewCvs', TileSize*3, TileSize*2)

/** @enum {number} */
const Type = freeze({None:-1,Pacman:0,Akabei:1,Pinky:2,Aosuke:3,Guzuta:4,Frightened:5})

/** @enum {number} */
const PacType = freeze({Normal:0,Losing:1})

/** @enum {number} */
const GhsType = freeze({Normal:0,Repaired:1,Hadake:2,Flashed:3})

class AnimeData {
	/** @param {{type?:Type, subType?:PacType|GhsType, pacman?:PacSprite, ghost?:Ghost}} */
	constructor({type,subType,pacman,ghost}={type:-1,subType:-1}) {
		this.animIdx  = 0
		this.flashIdx = 1
		this.pacman   = pacman
		this.ghost    = ghost
		this.type     = type
		this.subType  = subType
		this.orient   = Dir.Left
	}
}
function getOrient() {
	return String(byId('select-anim').orient.value)
}
!(function() { // Preview
	let   data = new AnimeData()
	const menu = new Menu.DorpDownMenu('animSelect')
	const ctx  = pvCvs.getContext('2d')
	const radioSelector = '.radioButtons input'

	function change(loop=false) {
		const [type,subType]= menu.value.split(':').map(Number)
		!loop && Timer.cancelAll()
		switch(type) {
		case Type.Pacman:
			data = new AnimeData({type,subType,pacman:new PacSprite(ctx)})
			if (setOrient(subType == PacType.Losing)) {
				data.pacman.setLosing()
				Timer.set(2200, ()=> change(true))
			}
			break
		case Type.Akabei:
		case Type.Pinky:
		case Type.Aosuke:
		case Type.Guzuta:
			data = new AnimeData({type,subType,ghost:new Ghost(T*2)})
			setOrient(subType != GhsType.Normal)
			break
		case Type.Frightened:
			data = new AnimeData({type,subType,ghost:new Ghost(T*2)})
			setOrient(true)
			break
		case Type.None:
			data = new AnimeData()
			Timer.cancelAll()
			setOrient(true)
			break
		}
	}
	function setOrient(disabled=false) {
		$(radioSelector).prop({disabled})
		!disabled && (data.orient = getOrient())
		return disabled
	}
	function drawPacman() {
		ctx.save()
		ctx.translate(S*1.5/2, S/2)
		ctx.scale(T/TileSize,  T/TileSize)
		data.pacman.draw({orient:data.orient,radius:PacScale*TileSize})
		ctx.restore()
	}
	function drawGhost() {
		ctx.save()
		data.subType == GhsType.Hadake
			? ctx.translate(S/4, S/4)
			: ctx.translate(S/2*2/2, S/4)
		data.ghost.sprite.draw({
			...ghost,
			mainCtx:    ctx,
			idx:        data.type-1,
			aIdx:       data.animIdx,
			orient:     data.orient,
			frightened: data.type    == Type.Frightened,
			spriteIdx:  data.subType == GhsType.Flashed? data.flashIdx : 0,
			hadaketa:   data.subType == GhsType.Hadake,
			repaired:   data.subType == GhsType.Repaired,
		})
		ctx.restore()
	}
	function update() {
		if (data.type < 0) return
		data.animIdx  ^= Ticker.count %  6 == 0
		data.flashIdx ^= Ticker.count % 14 == 0
		data.pacman?.update()
	}
	function draw() {
		ctx.clear()
		if (data.type < 0) return
		data.type == Type.Pacman
			? drawPacman()
			: drawGhost()
	}
	menu.bindChange(change)
	menu.root.addEventListener('keydown', e=> {
		// Enable switching of radio controls with the ← or → key
		const dir = Dir.from(e), vx = Vec2(dir).x
		const idx = +$(`${radioSelector}:enabled:checked`).data('idx')
		if (!menu.closed || !vx || isNaN(idx)) return
		$(radioSelector).eq((vx+idx+4) % 4).prop({checked:true}).trigger('change')
	})
	$(radioSelector).on('change', e=> {data.orient=e.target.value})
	Ticker.set(()=> {update();draw()})
}())