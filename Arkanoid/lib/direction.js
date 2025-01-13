export const [U,R,D,L]= 'Up|Right|Down|Left'.split('|')
export const Dir = freeze(new class {
	Up=U; Right=R; Down=D; Left=L;
	from(key) {
		const k = String(key).trim().replace(/^Arrow/,'')
		return [U,R,D,L].includes(k) ? k : null
	}
})