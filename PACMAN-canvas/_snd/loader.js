/** @typedef {import('./_manifest.js').SoundType} SoundType */
import {Manifest,ConfigMap,Ids} from './_manifest.js'

const {Sound:SoundJS}= createjs
const Instance = /**@type {{[key in SoundType]:createjs.AbstractSoundInstance}}*/({})

export class SoundMgr {
	static #loaded   = false
	static #disabled = true
	static load = ()=>
		new Promise((resolve,reject)=> {
			let amount = 0;
			SoundJS.registerSounds(Manifest)
			SoundJS.on('fileerror', reject)
			SoundJS.on('fileload', ()=> {
				if (++amount < Manifest.length) return
				SoundMgr.#disabled = false
				Ids.forEach(i=> Instance[i] = SoundJS.createInstance(i))
				resolve('All sound files loaded')
			})
		})
		.then (()=> this.#loaded = true)
		.catch(()=> this.#loaded = false)

	get loaded()   {return SoundMgr.#loaded}
	get disabled() {return SoundMgr.#disabled}
	get vol()      {return SoundJS.volume * 10}
	set vol(vol)   {SoundJS.volume = Number.isFinite(vol)? vol/10 : this.vol}

	/** @param {SoundType} id */
	isPlaying(id)  {return Instance[id]?.playState === SoundJS.PLAY_SUCCEEDED}

	/** @param {SoundType} id */
	isFinished(id) {return Instance[id]?.playState === SoundJS.PLAY_FINISHED}

	/** @param {SoundType} id */
	#configMerge(id, cfg={}) {
		const prefix = id.match(/^\D+/)?.[0] || ''
		return {...ConfigMap.get(prefix) ?? ConfigMap.get('_normal'), ...cfg}
	}

	/**
	 @param {boolean} enable
	 @param {...SoundType} ids
	*/
	pause(enable, ...ids) {
		ids.length
			? ids.forEach(id=> {Instance[id].paused=enable})
			: values(Instance).forEach(i=> i.paused=enable)
	}

	/**
	 @param {SoundType} id
	 @param {{duration?:number,loop?:number}} cfg
	*/
	play(id, cfg={}) {
		const {duration:dur}= cfg
		if (this.disabled) return
		if (typeof dur == 'number' && dur > 0)
			Instance[id].duration = dur
		Instance[id].play(this.#configMerge(id, cfg))
	}

	/**
	 @param {...SoundType} ids
	*/
	stop(...ids) {
		ids.length == 0 && SoundJS.stop()
		ids.forEach(id=> Instance[id].stop())
		return this
	}
}
