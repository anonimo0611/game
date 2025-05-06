import GhsSprite   from '../src/sprites/ghost.js'
import GhsSpriteCb from '../src/sprites/ghost_cb.js'
export class Ghost {
	/** @param {number} size */
	constructor(size) {
		this.idx      = 0
		this.size     = size
		this.cbSprite = GhsSpriteCb
		this.sprite   = new GhsSprite(canvas2D(null, size*4, size*3).ctx)
	}
}