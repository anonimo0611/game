'use strict'
const [U,R,D,L]='Up|Right|Down|Left'.split('|')
const Dir = function() {
	/** @enum {string} */
	const DirEnum  = {Up:U, Right:R, Down:D, Left:L}
	const FromWASD = new Map([['W',U],['A',L],['S',D],['D',R]])
	return freeze({
		...DirEnum,
		opp: new Map([[U,D],[R,L],[D,U],[L,R]]),
		/** @param {KeyboardEvent} e */
		from(e, {wasd=false}={}) {
			if (!isKeyboardEvent(e)) return null
			if (isCombinationKey(e)) return null
			const key = e.code.replace(/^(Arrow|Key)/,'')
			return this.has(key)? key
				: (wasd && FromWASD.get(key) || null)
		},
		/** @param {DirEnum} dir */
		has(dir) {return hasOwn(DirEnum,dir)},
	})
}()