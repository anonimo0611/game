import * as Menu   from '../_lib/menu.js'
import {Ticker}    from '../_lib/timer.js'
import {Timer}     from '../_lib/timer.js'
import {Dir}       from '../_lib/direction.js'
import PacSprite   from '../src/pacman/pac_sprite.js'
import {Ghost}     from './actor.js'
import {T,S,ghost} from './_constants.js'
import {PacScale,GhsType,TileSize} from '../src/_constants.js'

export const {cvs:pvCvs}=
	canvas2D('previewCvs', TileSize*3, TileSize*2)

!(function() { // Preview
	let _animIdx  = 0
	let _flashIdx = 0
	let _sprite   = null
	let _type     = null
	let _subType  = null
	let _orient   = Dir.Left

	const ctx  = pvCvs.getContext('2d')
	const menu = new Menu.DorpDownMenu('animSelect')

	function change(loop=false) {
		const [TYPE,SUB]= menu.value.split('-')
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
		case 'none':
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
		ctx.save()
		ctx.translate(S*1.5/2, S/2)
		ctx.scale(T/TileSize,  T/TileSize)
		_sprite.draw(ctx, {orient:_orient,radius:TileSize*PacScale})
		ctx.restore()
	}
	function drawGhost() {
		ctx.save()
		_subType == 'hadake'
			? ctx.translate(S/4, S/4)
			: ctx.translate(S/2*2/2, S/4)
		const spriteIdx = menu.value == 'frightened-flash'
			&& _flashIdx ? 1 : 0
		_sprite.sprite.draw({
			...ghost,spriteIdx,
			mainCtx:    ctx,
			idx:        GhsType[_type],
			aIdx:       _animIdx,
			orient:     _orient,
			frightened: _type    == 'frightened',
			hadaketa:   _subType == 'hadake',
			repaired:   _subType == 'repaired',
		})
		ctx.restore()
	}
	function update() {
		if (!_type) return
		_animIdx  ^= Ticker.count %  6 == 0
		_flashIdx ^= Ticker.count % 14 == 0
		if (_type == 'Pacman')
			_sprite.update()
	}
	function draw() {
		ctx.clearRect(0,0, pvCvs.width,pvCvs.height)
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
	menu.bindChange(change)
	$('input[name=dir]').on('input',function(){_orient = this.value})
}())