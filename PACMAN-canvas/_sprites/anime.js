import * as Menu   from '../_lib/menu.js'
import {Ticker}    from '../_lib/timer.js'
import {Timer}     from '../_lib/timer.js'
import {Vec2}      from '../_lib/vec2.js'
import {Dir}       from '../_lib/direction.js'
import {TileSize}  from '../src/_constants.js'
import {GhsType}   from '../src/_constants.js'
import PacSprite   from '../src/pacman/pac_sprite.js'
import {Ghost}     from './actor.js'
import {T,S,ghost} from './_constants.js'
export {pvCvs}

const animSelect = new Menu.DorpDownMenu('animSelect')
const [pvCvs,pvCtx]= canvas2D('previewCvs', TileSize*3, TileSize*2).vals

!(function() { // Preview
	let _animIdx  = 0
	let _flashIdx = 0
	let _sprite   = null
	let _type     = null
	let _subType  = null
	let _orient   = Dir.Left
	function change(loop=false) {
		const [TYPE,SUB]= animSelect.value.split('-')
		_animIdx  = 0
		_flashIdx = 0
		_type     = TYPE
		_subType  = SUB
		!loop && Timer.cancelAll()
		switch (TYPE) {
		case 'Pacman':
			_sprite = new PacSprite()
			if (setDirDisabled(_subType == 'losing')) {
				_sprite.setLosing()
				Timer.set(2200, ()=> change(true))
			}
			break
		case 'Akabei':
		case 'Pinky':
		case 'Aosuke':
		case 'Guzuta':
			_sprite = new Ghost(T*2)
			setDirDisabled(/hadake|repaired/.test(SUB))
			break
		case 'frightened':
			_sprite = new Ghost(T*2)
			setDirDisabled(true)
			break
		case 'default':
			Timer.cancelAll()
			setDirDisabled(true)
			_animIdx  = 0
			_flashIdx = 0
			_sprite   = null
			_type     = null
			_subType  = null
			break
		}
	}
	function setDirDisabled(bool) {
		isBool(bool) && $('.radioButtons input').prop({disabled:bool})
		return !!bool
	}
	function drawPacman() {
		pvCtx.save()
		pvCtx.translate(S*1.5/2, S/2)
		pvCtx.scale(T/TileSize,  T/TileSize)
		_sprite.obj.orient = _orient
		_sprite.draw(pvCtx, Vec2())
		pvCtx.restore()
	}
	function drawGhost() {
		pvCtx.save()
		_subType == 'hadake'
			? pvCtx.translate(S/4, S/4)
			: pvCtx.translate(S/2*2/2, S/4)
		const spriteIdx = animSelect.value == 'frightened-flash'
			&& _flashIdx ? 1 : 0
		_sprite.sprite.draw({
			...ghost,spriteIdx,
			mainCtx:    pvCtx,
			idx:        GhsType[_type],
			aIdx:       _animIdx,
			orient:     _orient,
			isHadake:   _subType == 'hadake',
			frightened: _type    == 'frightened',
			repaired:   _subType == 'repaired',
		})
		pvCtx.restore()
	}
	function update() {
		if (!_type) return
		_animIdx  ^= Ticker.count %  6 == 0
		_flashIdx ^= Ticker.count % 14 == 0
		if (_type == 'Pacman')
			_sprite.update()
	}
	function draw() {
		pvCtx.clearRect(0,0, pvCvs.width,pvCvs.height)
		if (!_type) return
		_type == 'Pacman'
			? drawPacman()
			: drawGhost()
	}
	function loop() {
		update()
		draw()
	}
	Ticker.set(loop)
	animSelect.bindEvent(change)
	$('input[name=dir]')
		.on('input',function(){_orient = this.value})
}())