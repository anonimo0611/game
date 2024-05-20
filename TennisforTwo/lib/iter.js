export const Itr = freeze(new class {
	some = itr=> fn=> {
	    for (const i of itr)
	    	if (fn(i)) return true;
	    return false;
	}
	every = itr=> fn=> {
	    for (const i of itr)
	    	if (!fn(i)) return false;
	    return true;
	}
	find = itr=> fn=> {
	    for (const i of itr)
	    	if (fn(i)) return i;
	}
	filter = itr=> fn=> {
		const ret = [];
	    for (const i of itr)
	    	if (fn(i)) ret.push(i);
		return ret;
	}
	map = itr=> fn=> {
		const ret = [];
	    for (const i of itr)
	    	ret.push(fn(i));
		return ret;
	}
	flatMap = itr=> fn=> Itr.map(itr)(fn).flat();
});