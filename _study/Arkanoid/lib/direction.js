export const [U,R,D,L]= 'Up|Right|Down|Left'.split('|')
export const Dir = freeze(new class {
	Up=U; Right=R; Down=D; Left=L;
	from(key, {awsd=false}={}) {
		const k = String(key).trim().replace(/^Arrow/,'')
		return [U,R,D,L].includes(k) ? k
			: (awsd && {A:L, W:U, S:D, D:R}[k.toUpperCase()] || null)
	}
})