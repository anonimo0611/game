'use strict'
const [U,R,D,L]='Up|Right|Down|Left'.split('|')
const Dir = function() {
	const WasdToDir = new Map([['W',U],['A',L],['S',D],['D',R]])
	return freeze({
		Up:U, Right:R, Down:D, Left:L,
		opp: new Map([[U,D],[R,L],[D,U],[L,R]]),
		/** @param {KeyboardEvent} e */
		from(e, {wasd=false}={}) {
			if (!isKeyboardEvent(e)) return null
			if (isCombinationKey(e)) return null
			const key = e.code.replace(/^(Arrow|Key)/,'')
			return hasOwn(Dir,key)? key
				: (wasd && WasdToDir.get(key) || null)
		},
	})
}()