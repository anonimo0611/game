export const U='Up',R='Right',D='Down',L='Left'
export const Dir = Object.freeze(new class {
	Up=U; Right=R; Down=D; Left=L;
	isValid    = (dir)=> Object.hasOwn(Dir, dir)
	opposite   = (dir)=> OppositeMap.get(dir)
	isOpposite = (a,b)=> this.opposite(a) == b
	from(e, {awsd=false}={}) {
		if (!isKeyboardEvent(e)) return null
		if (isCombinationKey(e)) return null
		const key = String(e.code).replace(/^(Arrow|Key)/,'')
		return Dir.isValid(key)? key
			: (awsd && DirFromAWSD.get(key.toUpperCase()) || null)
	}
})
,OppositeMap = new Map([[ U, D],[ R, L],[ D, U],[ L, R]])
,DirFromAWSD = new Map([['W',U],['D',R],['S',D],['A',L]])