const Manifest = [
{src:'./res/looped.ogg', data:{channels:3, audioSprite:[
	{id:'siren0', startTime:    0, duration: 402},
	{id:'siren1', startTime: 1402, duration: 327},
	{id:'siren2', startTime: 2730, duration: 298},
	{id:'siren3', startTime: 4028, duration: 265},
	{id:'escape', startTime: 5292, duration: 268},
	{id:'fright', startTime: 6561, duration: 538},
	{id:'start',  startTime:14233, duration:5000},
	]}
},
{src:'./res/regular.ogg', data:{channels:6, audioSprite:[
	{id:'eat0',   startTime: 1998, duration:  80},
	{id:'eat1',   startTime: 2137, duration:  80},
	{id:'losing', startTime:    0, duration:1749},
	{id:'biteGhs',startTime: 2603, duration: 575},
	]}
}];
const Ids = Manifest.flatMap(m=> m.data.audioSprite.map(s=> s.id));
const Config = new Map()
	.set('_normal', {loop: 0, volume: 1.00})
	.set('extend',  {loop: 0, volume: 0.80})
	.set('CBreak',  {loop: 1, volume: 1.00})
	.set('eat',     {loop: 0, volume: 0.60})
	.set('fright',  {loop:-1, volume: 0.55})
	.set('siren',   {loop:-1, volume: 0.90})
	.set('escape',  {loop:-1, volume: 0.90})
;
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