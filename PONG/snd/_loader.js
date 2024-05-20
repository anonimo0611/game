const manifest = [
{src:'./res/se.mp3', data:{channels:6, audioSprite:[
	{id:'se0',   startTime:    0, duration: 411},
	{id:'se1',   startTime:  440, duration: 242},
	{id:'se2',   startTime:  614, duration: 367},
	{id:'se4',   startTime: 1135, duration: 350},
	{id:'reset', startTime: 1500, duration: 300},
	]}
}]
export default freeze(class {
	static ids  = freeze(manifest.flatMap(m=> m.data.audioSprite.map(s=> s.id)))
	static #cfg = assign(Object.create(null), {
		_normal:{loop: 0, volume:1.00},
		se0:    {loop: 0, volume:0.70},
		se1:    {loop: 0, volume:1.00},
		se2:    {loop: 0, volume:0.50},
		se3:    {loop: 0, volume:1.00},
		reset:  {loop: 0, volume:0.70},
	})
	static get failed() {return failed}
	static configMerged = (id, cfg={})=>
		assign({...this.#cfg[String(id)] || cfg._normal}, cfg)
})
let amount = 0
let failed = true
createjs.Sound.registerSounds(manifest)
createjs.Sound.on('fileload', ()=> {
	if (++amount < manifest.length) return
	!(failed=false) && $(window).trigger('SoundLoaded')
})