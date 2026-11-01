export const U='Up', R='Right', D='Down', L='Left'
export const Dir = freeze({
	U,R,D,L,
	Rotation: freeze({Right:0|0, Down:PI/2, Left:PI, Up:-PI/2}),
	Opposite: freeze({Up:D, Right:L, Down:U, Left:R}),
	from(/**@type {KeyboardEventLike}*/e, {wasd=false}={}) {
		if (hasModifierKeys(e)) return null
		const pri = e.code.replace(/^(Arrow|Key)/,'')
		const sec = wasd && WasdMap.get(pri) || null
		const dir = DirSet.has(pri)? pri:sec
		return /**@type {Direction}*/(dir) ?? null
	},
})
const DirSet  = new Set([U,R,D,L])
const WasdMap = new Map([['W',U],['A',L],['S',D],['D',R]])