'use strict'
const U='Up',R='Right',D='Down',L='Left'
const DirEnum = freeze({Up:U, Right:R, Down:D, Left:L})
const Dir = function() {
	const FromWASD = new Map([['W',U],['A',L],['S',D],['D',R]])
	return freeze({
		...DirEnum,
		opp: new Map([[U,D],[R,L],[D,U],[L,R]]),
		/**
		 * @param {KeyboardEvent} e
		 * @returns {?keyof DirEnum}
		 */
		from(e, {wasd=false}={}) {
			if (!isKeyboardEvent(e)) return null
			if (isCombinationKey(e)) return null
			const key = e.code.replace(/^(Arrow|Key)/,'')
			return this.has(key)? key
				: (wasd && FromWASD.get(key) || null)
		},
		has(dir) {return hasOwn(DirEnum,dir)},
	})
}()