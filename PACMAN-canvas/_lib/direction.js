const U='Up', R='Right', D='Down', L='Left'
const DirSet   = new Set([U,R,D,L])
const WasdMap  = new Map([['W',U],['A',L],['S',D],['D',R]])

export const Dir = freeze({
	U,R,D,L,
	Rotation: freeze({Right:0|0, Down:PI/2, Left:PI, Up:-PI/2}),
	Opposite: freeze({Up:D, Right:L, Down:U, Left:R}),

	/** @param {KeyboardEvent|JQKeyboardEvent} e */
	from(e, {wasd=false}={}) {
		if (isCombiKey(e)) return null
		const k = e.code.replace(/^(Arrow|Key)/,'')
		return /**@type {?Direction}*/(
			DirSet.has(k)? k : (wasd && WasdMap.get(k)) || null
		)
	},
})