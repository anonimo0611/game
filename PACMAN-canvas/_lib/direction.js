export const Dir = freeze({
	enum: freeze({Up:U, Right:R, Down:D, Left:L}),

	/** @type {Map<Direction,Direction>} */
	opp: new Map([[U,D],[R,L],[D,U],[L,R]]),

	/** @type {Map<string,Direction>} */
	wasdToDir: new Map([['W',U],['A',L],['S',D],['D',R]]),

	/**
	 * @param {KeyboardEvent} e
	 * @returns {Direction|null}
	 */
	from(e, {wasd=false}={}) {
		if (isCombinationKey(e)) return null
		const key = e.code.replace(/^(Arrow|Key)/,'')
		return hasOwn(this.enum, key)? this.enum[key]
			: (wasd && this.wasdToDir.get(key) || null)
	},
})