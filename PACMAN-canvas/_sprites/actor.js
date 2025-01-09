import {Dir}       from '../_lib/direction.js'
import {Color}     from '../src/_constants.js'
import GhsSprite   from '../src/ghosts/ghost_sprite.js'
import PacSprite   from '../src/pacman/pac_sprite.js'
import GhsSpriteCb from '../src/ghosts/ghost_sprite_cb.js'

class Actor {
	prop(cfg) {
		if (!isObj(cfg)) return
		for (const [key,val] of Object.entries(cfg))
			this[key] = val
		return this
	}
}
export class Ghost extends Actor {
	constructor(size) {
		super()
		this.idx    = 0
		this.size   = size
		this.sprite = new GhsSprite(...canvas2D(null, size*4, size*3).vals)
	}
}
export class Akabei extends Ghost {
	orient   = Dir.Left
	Color    = Color.Akabei
	cbSprite = GhsSpriteCb.stakeClothes
}
export class Pacman extends Actor {
	constructor() {
		super()
		this.sprite = new PacSprite(this)
	}
}