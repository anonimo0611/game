export const [U,R,D,L,C]= 'Up|Right|Down|Left|Center'.split('|')
export const Dir = freeze(new class {
	Up=U; Right=R; Down=D; Left=L;
	#direction = new Set([U,R,D,L]);
	#angleFrom = new Map([[L,0],[U,90],[R,180],[D,-90]]);
	isValid(arg)  {return this.#direction.has(arg)}
	angle(dir)    {return this.#angleFrom.get(dir) ?? 0}
	opposite(dir) {return this.toVec2(dir).opposite}
	toVec2(dir, s=1, {x=0, y=0}={}) {
		switch (dir) {
		case U:  return {x, y:y-s, step: s, opposite: D}
		case R:  return {x:x+s, y, step: s, opposite: L}
		case D:  return {x, y:y+s, step: s, opposite: U}
		case L:  return {x:x-s, y, step: s, opposite: R}
		default: return {x,     y, step: 0, opposite: null}
		}
	}
	from(str, {awsd=false}={}) {
		const k = String(str).trim().replace(/^(Arrow|Key)/,'')
		return this.isValid(k)
			? k : (awsd && {A:L, W:U, S:D, D:R}[k.toUpperCase()] || null)
	}
})