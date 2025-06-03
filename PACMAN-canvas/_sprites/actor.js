import GhsSprite   from '../src/sprites/ghost.js'
import GhsSpriteCb from '../src/sprites/ghost_cb.js'
export class Ghost {
	constructor(/**@type {number}*/size) {
		this.size     = size
		this.cbSprite = GhsSpriteCb
		this.sprite   = new GhsSprite(canvas2D(null, size*4, size*3).ctx)
	}
}