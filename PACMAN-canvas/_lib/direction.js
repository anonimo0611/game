const U='Up', R='Right', D='Down', L='Left'
const DirSet  = new Set([U,R,D,L])
const WasdMap = new Map([['W',U],['A',L],['S',D],['D',R]])

export const Dir = new class {
	/** @readonly */U = U;
	/** @readonly */R = R;
	/** @readonly */D = D;
	/** @readonly */L = L;

	/** @readonly */
	Opposite = freeze({[U]:D, [R]:L, [D]:U, [L]:R})

	/** @param {KeyboardEvent|JQuery.KeyboardEventBase} e */
	from(e, {wasd=false}={}) {
		if (isCombiKey(e)) return null
		const k = e.code.replace(/^(Arrow|Key)/,'')
		return /**@type {?('Up'|'Right'|'Down'|'Left')}*/(
			DirSet.has(k)? k : (wasd && WasdMap.get(k)) || null
		)
	}
}