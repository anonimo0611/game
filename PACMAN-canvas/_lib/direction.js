export const [U,R,D,L]='Up|Right|Down|Left'.split('|')
export const Dir = freeze(new class {
	Up=U; Right=R; Down=D; Left=L;
	isValid    = (dir)=> hasOwn(Dir, dir)
	opposite   = (dir)=> OppositeMap.get(dir)
	isOpposite = (a,b)=> this.opposite(a) == b
	from(e, {wasd=false}={}) {
		if (!isKeyboardEvent(e)) return null
		if (isCombinationKey(e)) return null
		const key = String(e.code).replace(/^(Arrow|Key)/,'')
		return Dir.isValid(key)? key
			: (wasd && DirFromWASD.get(key) || null)
	}
})
,OppositeMap = new Map([[ U, D],[ R, L],[ D, U],[ L, R]])
,DirFromWASD = new Map([['W',U],['A',L],['S',D],['D',R]])