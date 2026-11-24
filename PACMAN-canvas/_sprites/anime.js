import PacSprite from '@/sprites/pacman.js'
import {Dir}     from '@lib/direction.js'
import {ghostPv} from './_constants.js'
import {TS,AS,Pv,AnimMenu,$dirBtns} from './_constants.js'

const Schema = /**@type {const}*/
({
	Actor: {None: -1, Pacman:0, Akabei:1, Pinky:2, Aosuke:3, Guzuta:4, Fright:5},
	Pacman:{Normal:0, Dying:1},
	Ghost: {Normal:0, Mended:1, Exposed:2, Flashed:3}
})

class ActorPreview {
	constructor(type=0,subType=0) {
		this.animIdx  = 0
		this.flashIdx = 0
		this.type     = type
		this.subType  = subType
		this.ghost    = ghostPv
		this.pacman   = new PacSprite(Pv, TS)
		this.orient   = DirL
	}
}

;(new class Preview {
	subj = /**@type {?ActorPreview}*/(null)
	constructor() {
		Ticker.set(this)
		$dirBtns.on('change', ({target:btn})=> {
			if (this.subj)
				this.subj.orient = /**@type {Direction}*/(
					btn.getAttribute('value')
				)
		})
		$(AnimMenu.root)
			.on('change', this.onChangeMenu)
			.on('keydown',this.onKeydown)
	}
	onChangeMenu = ()=> {
		const [type,subType]= AnimMenu.value.split(':').map(Number)
		switch(type) {
		case Schema.Actor.None:
			this.subj = null
			this.btnDisabled(true)
			break

		case Schema.Actor.Pacman:
			this.subj = new ActorPreview(type,subType)
			if (this.btnDisabled(subType == Schema.Pacman.Dying))
				this.subj.pacman.startDying(this.onChangeMenu)
			break

		case Schema.Actor.Akabei:
		case Schema.Actor.Pinky:
		case Schema.Actor.Aosuke:
		case Schema.Actor.Guzuta:
		case Schema.Actor.Fright:
			this.subj = new ActorPreview(type,subType)
			this.btnDisabled(
				Schema.Actor.Fright == type ||
				Schema.Ghost.Normal != subType
			)
			break
		}
	}
	onKeydown = (/**@type {JQKeyboardEvent}*/e)=> {
		const dir = Dir.from(e)
		if (dir) {
			const vx  = Vec2[dir].x
			const len = +$dirBtns.length
			const idx = +$dirBtns.filter(':enabled:checked').data('idx')
			AnimMenu.closed
				&& vx
				&& isFinite(idx)
				&& $dirBtns
					.eq((vx+idx+len) % len)
					.prop({checked:true})
					.trigger('change')
		}
	}
	btnDisabled = (disabled=false)=> {
		const {subj}= this
		$dirBtns.prop({disabled})
		if (!disabled && subj)
			subj.orient = /**@type {Direction}*/
				($('input[name=orient]:checked').attr('value'))
		return disabled
	}
	drawPacman = ()=> {
		const {subj}= this
		Pv.save()
		Pv.translate(Pv.canvas.width/2, AS/2)
		subj?.pacman.draw({orient:subj.orient, radius:TS})
		Pv.restore()
	}
	drawGhost = ()=> {
		const {subj}= this
		const {width:PvW,height:PvH}= Pv.canvas
		Pv.save()
		subj?.subType == Schema.Ghost.Exposed
			? Pv.translate(PvW/2-TS/2, PvH/2)
			: Pv.translate(PvW/2, PvH/2)

		subj?.ghost.draw({
			type:        subj.type-1,
			animIdx:     subj.animIdx,
			orient:      subj.orient,
			isFrightened:subj.type    == Schema.Actor.Fright,
			isExposed:   subj.subType == Schema.Ghost.Exposed,
			isMended:    subj.subType == Schema.Ghost.Mended,
			spriteIdx:   subj.subType == Schema.Ghost.Flashed ? subj.flashIdx:0,
		})
		Pv.restore()
	}
	update = ()=> {
		const {subj}= this
		if (subj) {
			subj.animIdx  ^= +(Ticker.count %  6 == 0)
			subj.flashIdx ^= +(Ticker.count % 14 == 1)
			subj.pacman?.update()
		}
	}
	draw = ()=> {
		const {subj}= this
		Pv.clear()
		if (subj) {
			subj.type == Schema.Actor.Pacman
				? this.drawPacman()
				: this.drawGhost()
		}
	}
})