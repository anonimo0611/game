const {Sound:SoundJS}= createjs

/** @type {Map<string,createjs.AbstractSoundInstance>} */
const Instance = new Map()

/** @typedef {import("./_manifest.js").SoundType} SoundType */

import {Manifest,ConfigMap,Ids} from './_manifest.js'
export class SoundMgr {
	static #disabled = true
	static setup = ()=>
		new Promise((resolve, reject)=> {
			let amount = 0;
			SoundJS.registerSounds(Manifest)
			SoundJS.on('fileerror', reject)
			SoundJS.on('fileload', ()=> {
				if (++amount < Manifest.length)
					return
				SoundMgr.#disabled = false
				Ids.forEach(i=> Instance.set(i, SoundJS.createInstance(i)))
				resolve(true)
			})
		})
		.catch(()=> false)

	set vol(vol)   {SoundJS.volume = Number.isFinite(vol)? vol/10 : this.vol}
	get vol()      {return SoundJS.volume * 10}
	get disabled() {return SoundMgr.#disabled}

	/** @param {SoundType} id */
	isPlaying(id)  {return Instance.get(id)?.playState === SoundJS.PLAY_SUCCEEDED}

	/** @param {SoundType} id */
	isFinished(id) {return Instance.get(id)?.playState === SoundJS.PLAY_FINISHED}

	/** @param {SoundType} id */
	#configMerge(id, cfg={}) {
		const prefix = id.match(/^\D+/)?.[0] || ''
		return {...ConfigMap.get(prefix) || ConfigMap.get('_normal'), ...cfg}
	}

	/**
	 * @param {SoundType} id
	 * @param {{duration?:number,loop?:number}} cfg}
	 */
	play(id, cfg={}) {
		const instance = Instance.get(id)
		if (this.disabled || !instance)
			return
		if (typeof cfg.duration == 'number')
			instance.duration = cfg.duration
		instance.play(this.#configMerge(id, cfg))
	}

	/** @param {...SoundType} ids */
	stop(...ids) {
		ids.length == 0 && SoundJS.stop()
		ids.forEach(id=> Instance.get(id)?.stop())
		return this
	}

	/**
	 * @param {boolean} bool
	 * @param {...SoundType} ids
	 */
	paused(bool, ...ids) {
		ids.forEach(id=> {
			const instance = Instance.get(id)
			instance && (instance.paused=bool)
		})
	}

	/** @param {boolean} bool */
	set allPaused(bool) {
		Instance.forEach(i=> i.paused = bool)
	}
}freeze(SoundMgr)