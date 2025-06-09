const {Sound:SoundJS}= createjs
const Instance = /**@type {Map<string,createjs.AbstractSoundInstance>}*/(new Map)

/** @typedef {import('_manifest.js').SoundType} SoundType */
import {Manifest,ConfigMap,Ids} from './_manifest.js'

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
				Ids.forEach(i=> Instance.set(i, SoundJS.createInstance(i)))
				resolve('All sound files loaded')
			})
		})
		.then (()=> this.#loaded = true)
		.catch(()=> this.#loaded = false)

	get loaded()   {return SoundMgr.#loaded}
	get disabled() {return SoundMgr.#disabled}
	get vol()      {return SoundJS.volume * 10}
	set vol(vol)   {SoundJS.volume = Number.isFinite(vol)? vol/10 : this.vol}

	/** @param {boolean} bool */
	set allPaused(bool) {Instance.forEach(i=> i.paused = bool)}

	/**
	 * @param {boolean} bool
	 * @param {...SoundType} ids
	 */
	paused(bool, ...ids) {
		ids.forEach(id=> {const i=Instance.get(id);i && (i.paused=bool)})
	}

	/** @param {SoundType} id */
	isPlaying(id)  {return Instance.get(id)?.playState === SoundJS.PLAY_SUCCEEDED}

	/** @param {SoundType}id */
	isFinished(id) {return Instance.get(id)?.playState === SoundJS.PLAY_FINISHED}

	/** @param {SoundType}id */
	#configMerge(id, cfg={}) {
		const prefix = id.match(/^\D+/)?.[0] || ''
		return {...ConfigMap.get(prefix) ?? ConfigMap.get('_normal'), ...cfg}
	}

	/**
	 * @param {SoundType} id
	 * @param {{duration?:number,loop?:number}} cfg
	 */
	play(id, cfg={}) {
		const instance = Instance.get(id)
		const {duration:dur}= cfg
		if (this.disabled || !instance) return
		if (typeof dur == 'number' && isFinite(dur))
			instance.duration = dur
		instance.play(this.#configMerge(id, cfg))
	}

	/** @param {...SoundType} ids */
	stop(...ids) {
		ids.length == 0 && SoundJS.stop()
		ids.forEach(id=> Instance.get(id)?.stop())
		return this
	}
}