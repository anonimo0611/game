const Opposite = freeze({Up:D, Right:L, Down:U, Left:R})
const FromWASD = freeze({W:U, A:L, S:D, D:R})

export const Dir = freeze(new class {
	Up=U; Right=R; Down=D; Left=L;

	/** @param {Direction} dir */
	opposite(dir) {return Opposite[dir]}

	/**
	 * @param {KeyboardEvent} e
	 * @returns {Direction|null}
	 */
	from(e, {wasd=false}={}) {
		if (isCombinationKey(e)) return null
		const  key = e.code.replace(/^(Arrow|Key)/,'')
		return Dir[key] || (wasd && FromWASD[key] || null)
	}
})