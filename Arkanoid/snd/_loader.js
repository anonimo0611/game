const Manifest = [
	{src:'./res/sound.ogg', data:{channels:6, audioSprite:[
		{id:'start',  startTime:     0, duration: 2100},
		{id:'se0',    startTime:  2127, duration: 1056},
		{id:'se1',    startTime:  3699, duration: 1776},
		{id:'se2',    startTime:  5478, duration: 1772},
		{id:'shot',   startTime:  7245, duration:  727},
		{id:'item',   startTime:  8012, duration:  743},
		{id:'bomb',   startTime:  8844, duration:  743},
		{id:'destroy',startTime:  9594, duration: 1683},
		]}
	}]
const Config = new Map()
	.set('_normal',{loop: 0, volume:1.00})
	.set('se0',    {loop: 0, volume:0.40})
	.set('se1',    {loop: 0, volume:0.40})
	.set('se2',    {loop: 0, volume:0.40})
	.set('shot',   {loop: 0, volume:0.80})
;

const {Sound}= createjs
const Ids = Manifest.flatMap(m=> m.data.audioSprite.map(s=> s.id))

export const Instance = new Map();
export class Loader {
	static #failed = true
	static setup() {
		return new Promise(this.#setup).catch(()=> false)
	}
	static #setup(resolve, reject) {
		let amount = 0
		Sound.registerSounds(Manifest)
		Sound.on('fileerror', reject)
		Sound.on('fileload', _=> {
			if (++amount < Manifest.length) {
				return
			}
			Loader.#failed = false
			Ids.forEach(id=> Instance.set(id, Sound.createInstance(id)))
			Instance.forEach(i=> i.setPaused = bool=> i.paused = bool)
			resolve(true)
		});
	}
	get failed()  {return Loader.#failed}
	get vol()     {return Sound.volume*10}
	set vol(vol)  {Sound.volume = isNum(vol)? vol/10 : this.vol}
	stop()        {Sound.stop()}
	play(id, cfg) {Sound.play(id, cfg)}
	configMerge(id, cfg={}) {
		return {...Config.get(id) || Config.get('_normal'), ...cfg};
	}
}