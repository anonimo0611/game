export const [U,R,D,L]= 'Up|Right|Down|Left'.split('|');
export const Dirs = freeze([U,R,D,L]);
export const Dir  = freeze(new class {
	Up=U; Right=R; Down=D; Left=L;
	#Opposite  = new Map([[U,D],[R,L],[D,U],[L,R]]);
	opposite   = (dir)=> this.#Opposite.get(dir) || null;
	isOpposite = (a,b)=> this.opposite(a) == b;
	from(e, {awsd=false}={}) {
		if (!isKeyboardEvent(e)) return null;
		if (isCombinationKey(e)) return null;
		const key = e.code.replace(/^(Arrow|Key)/,'');
		return Dirs.includes(key)
			? key
			: (awsd && {A:L, W:U, S:D, D:R}[key.toUpperCase()] || null);
	}
});