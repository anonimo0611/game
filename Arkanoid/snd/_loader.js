const manifest = [
{src:'./res/sound.ogg', data:{channels:6, audioSprite:[
	{id:'start',  startTime:     0, duration: 2054},
	{id:'se0',    startTime:  2127, duration: 1056},
	{id:'se1',    startTime:  3699, duration: 1776},
	{id:'se2',    startTime:  5478, duration: 1772},
	{id:'shot',   startTime:  7245, duration:  727},
	{id:'item',   startTime:  8012, duration:  743},
	{id:'bomb',   startTime:  8844, duration:  743},
	{id:'destroy',startTime:  9594, duration: 1683},
	]}
}]
export default freeze(class {
	static ids  = freeze(manifest.flatMap(m=> m.data.audioSprite.map(s=> s.id)))
	static #cfg = assign(Object.create(null), {
		_normal:{loop: 0, volume:1.00},
		se0:    {loop: 0, volume:0.40},
		se1:    {loop: 0, volume:0.40},
		se2:    {loop: 0, volume:0.40},
		shot:   {loop: 0, volume:0.80},
		item:   {loop: 0, volume:1.00},
		bomb:   {loop: 0, volume:1.00},
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