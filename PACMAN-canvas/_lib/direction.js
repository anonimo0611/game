const DirSet   = new Set([U,R,D,L])
const FromWASD = new Map([['W',U],['A',L],['S',D],['D',R]])
const Opposite = freeze({Up:D, Right:L, Down:U, Left:R})

export const Dir = freeze({
	Up:U, Right:R, Down:D, Left:L,

	/** @param {Direction} dir */
	opposite(dir) {return Opposite[dir]},

	/** @param {KeyboardEvent|JQuery.KeyDownEvent} e */
	from(e, {wasd=false}={}) {
		if (isCombinationKey(e)) return null
		const k = e.code.replace(/^(Arrow|Key)/,'')
		return /** @type Direction|null */(
			DirSet.has(k) ? k : (wasd && FromWASD.get(k)) || null
		)
	},
})