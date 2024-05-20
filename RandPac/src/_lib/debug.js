const Debug = new class {
	#list = [];
	one(...args) {
		this.#list.length && (this.#list = []);
		byId('log').textContent = args.map(a=> JSON.stringify(a)).join(',');
	}
	log(...args) {
		this.#list.push(args.map(a=> JSON.stringify(a)).join(','));
		this.#list.length > 20 && this.#list.shift();
		byId('log').textContent = this.#list.map(this.#format).join('\n');
	}
	#format(d, i) {
		return String(i+1).padStart(2, 0)+':'+d;
	}
};