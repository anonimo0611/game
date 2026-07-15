export
const U='Up', R='Right', D='Down', L='Left'
const WasdMap = /**@type {DirDict}*/({W:U, A:L, S:D, D:R})
const DirEnum = /**@type {DirDict}*/({[U]:U, [R]:R, [D]:D, [L]:L})

export
const Dir = freeze({
	U,R,D,L,
	Rotation: freeze({Right:0|0, Down:PI/2, Left:PI, Up:-PI/2}),
	Opposite: freeze({Up:D, Right:L, Down:U, Left:R}),
	/** @param {KeyboardEvent|JQKeyboardEvent} e */
	from(e, {wasd=false}={}) {
		if (hasModifierKeys(e)) return null
		const k = e.code.replace(/^(Arrow|Key)/,'')
		return (DirEnum[k] ?? (wasd && WasdMap[k])) || null
	},
})