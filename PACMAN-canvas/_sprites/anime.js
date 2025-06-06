import {Dir}     from '../_lib/direction.js'
import * as Menu from '../_lib/menu.js'
import PacSprite from '../src/sprites/pacman.js'
import {Ghost}   from './actor.js'
import {T,S,ghost,resize} from './_constants.js'
export const {ctx:PvC}= canvas2D('previewCvs')

const Type    = /**@type {const}*/({None:-1,Pacman:0,Akabei:1,Pinky:2,Aosuke:3,Guzuta:4,Frightened:5})
const PacType = /**@type {const}*/({Normal:0,Losing:1})
const GhsType = /**@type {const}*/({Normal:0,Mended:1,Exposed:2,Flashed:3})

class AnimeData {
	/** @param {{type?:number, subType?:number, pacman?:PacSprite, ghost?:Ghost}} params */
	constructor({type,subType,pacman,ghost}={}) {
		this.animIdx  = 0
		this.flashIdx = 1
		this.pacman   = pacman
		this.ghost    = ghost
		this.type     = type ?? -1
		this.subType  = subType ?? -1
		this.orient   = /**@type {Direction}*/(L)
	}
}
const getOrient = ()=> /**@type {Direction}*/(
	$('input[name=orient]:checked').attr('value')
)
;(function() { // Preview
	let   data = new AnimeData()
	const menu = new Menu.DorpDown('animSelect')
	const radioSelector = '.radioButtons input'

	function change(loop=false) {
		const [type,subType]= menu.value.split(':').map(Number)
		!loop && Timer.cancelAll()
		switch(type) {
		case Type.Pacman:
			data = new AnimeData({type,subType,pacman:new PacSprite(PvC)})
			if (setOrientCtrl({disabled:subType == PacType.Losing})) {
				data.pacman?.setLosing()
				Timer.set(2200, ()=> change(true), {key:'Losing'})
			}
			break
		case Type.Akabei:
		case Type.Pinky:
		case Type.Aosuke:
		case Type.Guzuta:
			data = new AnimeData({type,subType,ghost:new Ghost(T*2)})
			setOrientCtrl({disabled:subType != GhsType.Normal})
			break
		case Type.Frightened:
			data = new AnimeData({type,subType,ghost:new Ghost(T*2)})
			setOrientCtrl({disabled:true})
			break
		case Type.None:
			data = new AnimeData()
			Timer.cancelAll()
			setOrientCtrl({disabled:true})
			break
		}
	}
	function setOrientCtrl({disabled=false}={}) {
		$(radioSelector).prop({disabled})
		!disabled && (data.orient = getOrient())
		return disabled
	}
	function drawPacman() {
		PvC.save()
		PvC.translate(S*1.5/2, S/2)
		PvC.scale(T/TileSize,  T/TileSize)
		data.pacman?.draw({orient:data.orient,radius:PacScale*TileSize})
		PvC.restore()
	}
	function drawGhost() {
		PvC.save()
		data.subType == GhsType.Exposed
			? PvC.translate(S/4, S/4)
			: PvC.translate(S/2*2/2, S/4)
		data.ghost?.sprite.draw({
			...ghost,
			mainCtx:   PvC,
			color:     Color[GhsNames[data.type-1]],
			aIdx:      data.animIdx,
			orient:    data.orient,
			spriteIdx: data.subType == GhsType.Flashed? data.flashIdx : 0,
			isFright:  data.type    == Type.Frightened,
			isExposed: data.subType == GhsType.Exposed,
			isMended:  data.subType == GhsType.Mended,
		})
		PvC.restore()
	}
	function update() {
		resize()
		if (data.type < 0)
			return
		data.animIdx  ^= +(Ticker.count %  6 == 0)
		data.flashIdx ^= +(Ticker.count % 14 == 0)
		data.pacman?.update()
	}
	function draw() {
		PvC.clear()
		if (data.type < 0)
			return
		data.type == Type.Pacman
			? drawPacman()
			: drawGhost()
	}
	menu.on({change})
	menu.$root.on('keydown', e=> {
		// Enable switching of radio controls with the ← or → key
		const dir = Dir.from(e)
		if (dir) {
			const vx  = Vec2[dir].x
			const idx = +$(`${radioSelector}:enabled:checked`).data('idx')
			if (!menu.closed || !vx || isNaN(idx)) return
			$(radioSelector).eq((vx+idx+4) % 4).prop({checked:true}).trigger('change')
		}
	})
	$(radioSelector).on('change', e=> {
		data.orient = /**@type {Direction}*/(
			e.target.getAttribute('value')
		)
	})
	Ticker.set(()=> {update(),draw()})
})()