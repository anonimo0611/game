const Manifest = [
{src:'./res/sound.ogg', data:{channels:6, audioSprite:[
	{id:'se0',      startTime:       0, duration: 89.292},
	{id:'se1',      startTime:  92.667, duration: 96.614},
	{id:'se2',      startTime: 188.970, duration: 96.407},
	{id:'se3',      startTime: 284.961, duration:106.588},
	{id:'killed',   startTime: 392.211, duration:309.847},
	{id:'shoot',    startTime: 697.316, duration:384.105},
	{id:'explosion',startTime:1076.315, duration:790},
	{id:'ufo_high', startTime:1868.346, duration:165.713},
	{id:'ufo_low',  startTime:2033.557, duration:2034.590},
	]}
}]
const Ids = Manifest.flatMap(m=> m.data.audioSprite.map(s=> s.id));
const Config = new Map()
	.set('_normal',  {loop: 0, volume:1.00})
	.set('se0',      {loop: 0, volume:1.00})
	.set('se1',      {loop: 0, volume:1.00})
	.set('se2',      {loop: 0, volume:1.00})
	.set('se3',      {loop: 0, volume:1.00})
	.set('killed',   {loop: 0, volume:0.50})
	.set('shoot',    {loop: 0, volume:0.70})
	.set('explosion',{loop: 0, volume:1.00})
	.set('ufo_high', {loop:-1, volume:0.30})

export const Instance = new Map();
export class Loader {
	static #failed = true;
	static setup() {return new Promise(this.#setup)}
	static #setup(resolve, reject) {
		let amount = 0;
		createjs.Sound.registerSounds(Manifest);
		createjs.Sound.on('fileerror', reject);
		createjs.Sound.on('fileload', _=> {
			if (++amount < Manifest.length) return;
			Loader.#failed = false;
			Ids.forEach(id=> Instance.set(id, createjs.Sound.createInstance(id)));
			Instance.forEach(i=> i.setPaused = bool=> i.paused = bool);
			resolve(true);
		});
	}
	get failed()  {return Loader.#failed}
	get vol()     {return createjs.Sound.volume*10}
	set vol(vol)  {createjs.Sound.volume = isNum(vol)? vol/10 : this.vol}
	stop()        {createjs.Sound.stop()}
	play(id, cfg) {createjs.Sound.play(id, cfg)}
	configMerge(id, cfg={}) {
		const prefix = isStr(id) && id.match(/^\D+/)?.[0] || null;
		return {...Config.get(prefix) || Config.get('_normal'), ...cfg};
	}
}