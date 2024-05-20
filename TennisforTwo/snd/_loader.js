const Manifest = [
{src:'./res/se.mp3', data:{channels:4, audioSprite:[
	{id:'start', startTime:    0, duration: 411},
	{id:'shot',  startTime:  440, duration: 242},
	{id:'bound', startTime:  714, duration: 548},
	{id:'point', startTime: 1282, duration: 283},
	{id:'info',  startTime: 1654, duration: 208},
	{id:'netIn', startTime: 1930, duration: 300},
	]}
}];
const Ids = Manifest.flatMap(m=> m.data.audioSprite.map(s=> s.id));

const Config = new Map()
	.set('_normal',{loop: 0, volume:1.00})
	.set('start',  {loop: 0, volume:0.70})
	.set('shot',   {loop: 0, volume:1.00})
	.set('bound',  {loop: 0, volume:1.00})
	.set('point',  {loop: 0, volume:1.00})
	.set('reset',  {loop: 0, volume:0.70})
	.set('netIn',  {loop: 0, volume:1.00})
;
export const Instance = new Map();
export class Loader {
	static #failed = true;
	static setup() {return new Promise(this.#setup).catch(()=> false)}
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