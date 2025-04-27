import * as Menu   from '../_lib/menu.js'
import PacSprite   from '../src/sprites/pacman.js'
import {Ghost}     from './actor.js'
import {T,S,ghost} from './_constants.js'
export const {ctx:PvC}= canvas2D('previewCvs', TileSize*3, TileSize*2)

const Type    = freeze({None:-1,Pacman:0,Akabei:1,Pinky:2,Aosuke:3,Guzuta:4,Frightened:5})
const PacType = freeze({Normal:0,Losing:1})
const GhsType = freeze({Normal:0,Repaired:1,Hadake:2,Flashed:3})

class AnimeData {
	/** @param {{type?:number, subType?:number, pacman?:PacSprite, ghost?:Ghost}} */
	constructor({type,subType,pacman,ghost}={type:-1,subType:-1}) {
		this.animIdx  = 0
		this.flashIdx = 1
		this.pacman   = pacman
		this.ghost    = ghost
		this.type     = type
		this.subType  = subType
		this.orient   = Left
	}
}
function getOrient() {
	return String(byId('select-anim').orient.value)
}
!(function() { // Preview
	let   data = new AnimeData()
	const menu = new Menu.DorpDown('animSelect')
	const radioSelector = '.radioButtons input'

	function change(loop=false) {
		const [type,subType]= menu.value.split(':').map(Number)
		!loop && Timer.cancelAll()
		switch(type) {
		case Type.Pacman:
			data = new AnimeData({type,subType,pacman:new PacSprite(PvC)})
			if (setOrient(subType == PacType.Losing)) {
				data.pacman.setLosing()
				Timer.set(2200, ()=> change(true), {key:'Losing'})
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
		PvC.save()
		PvC.translate(S*1.5/2, S/2)
		PvC.scale(T/TileSize,  T/TileSize)
		data.pacman.draw({orient:data.orient,radius:PacScale*TileSize})
		PvC.restore()
	}
	function drawGhost() {
		PvC.save()
		data.subType == GhsType.Hadake
			? PvC.translate(S/4, S/4)
			: PvC.translate(S/2*2/2, S/4)
		data.ghost.sprite.draw({
			...ghost,
			mainCtx:    PvC,
			idx:        data.type-1,
			aIdx:       data.animIdx,
			orient:     data.orient,
			frightened: data.type    == Type.Frightened,
			spriteIdx:  data.subType == GhsType.Flashed? data.flashIdx : 0,
			hadaketa:   data.subType == GhsType.Hadake,
			repaired:   data.subType == GhsType.Repaired,
		})
		PvC.restore()
	}
	function update() {
		if (data.type < 0)
			return
		data.animIdx  ^= Ticker.count %  6 == 0
		data.flashIdx ^= Ticker.count % 14 == 0
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
	menu.bind({change})
	menu.root.addEventListener('keydown', e=> {
		// Enable switching of radio controls with the ← or → key
		const dir = Dir.from(e)
		if (dir) {
			const vx  = Vec2[dir].x
			const idx = +$(`${radioSelector}:enabled:checked`).data('idx')
			if (!menu.closed || !vx || isNaN(idx)) return
			$(radioSelector).eq((vx+idx+4) % 4).prop({checked:true}).trigger('change')
		}
	})
	$(radioSelector).on('change', e=> {data.orient=e.target.value})
	Ticker.set(()=> {update();draw()})
}())