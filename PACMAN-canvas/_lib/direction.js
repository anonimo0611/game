export const U='Up', R='Right', D='Down', L='Left'
export const Dir = freeze({
	U,R,D,L,
	NULL:     /**@type {?Direction}*/(null),
	Rotation: freeze({Right:0|0, Down:PI/2, Left:PI, Up:-PI/2}),
	Opposite: freeze({Up:D, Right:L, Down:U, Left:R}),
	/** @param {KeyboardEventLike} e */
	from(e, {wasd=false}={}) {
		if (hasModifierKeys(e)) return null
		const  map = /**@type {DirMap}*/(wasd? Keys:Dirs)
		return map[e.code.replace(/^(Arrow|Key)/,'')] ?? null
	}
})
const Dirs = asEnum(U,R,D,L)
const Keys = freeze({...Dirs,W:U,A:L,S:D,D:R})