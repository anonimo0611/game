import {Dir}       from '../_lib/direction.js'
import {Color}     from '../src/_constants.js'
import GhsSprite   from '../src/ghosts/ghs_sprite.js'
import GhsSpriteCb from '../src/ghosts/ghs_sprite_cb.js'

export class Ghost {
	constructor(size) {
		this.idx    = 0
		this.size   = size
		this.sprite = new GhsSprite(...canvas2D(null, size*4, size*3).vals)
	}
	prop(cfg) {
		if (!isObj(cfg)) return
		for (const [key,val] of Object.entries(cfg))
			this[key] = val
		return this
	}
}
export class Akabei extends Ghost {
	orient   = Dir.Left
	Color    = Color.Akabei
	cbSprite = GhsSpriteCb.stakeClothes
}