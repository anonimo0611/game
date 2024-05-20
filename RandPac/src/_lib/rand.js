export class XorShift {
	#w;
	#x = 123456789;
	#y = 362436069;
	#z = 521288629;
	constructor(seed) {
		const SEED_MAX = 4294967295;
		if (!isNum(seed)) seed = randInt(0, SEED_MAX);
		this.seed = this.#w = int(clamp(seed, 0, SEED_MAX));
		freeze(this);
	}
	get #next() {
		const t = this.#x ^ (this.#x << 11);
		this.#x = this.#y;
		this.#y = this.#z;
		this.#z = this.#w;
		return this.#w = (this.#w ^ (this.#w >>> 19)) ^ (t ^ (t >>> 8));
	}
	nextInt(min, max) {
		return min + (abs(this.#next) % (max + 1 - min));
	}
	choice(...arg) {
		arg = arg.length == 1 && isArray(arg[0]) ? arg[0] : arg;
		return arg[this.nextInt(0, arg.length-1)];
	}
}