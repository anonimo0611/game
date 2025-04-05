const {Sound}  = createjs
const Instance = new Map()

import {Manifest,ConfigMap,SoundIds} from './_manifest.js'
export class SoundMgr {
	static #disabled = true
	static ids = SoundIds
	static setup() {return new Promise(this.#setup)}
	static #setup(resolve, reject) {
		let amount = 0;
		Sound.registerSounds(Manifest)
		Sound.on('fileerror', reject)
		Sound.on('fileload', ()=> {
			if (++amount < Manifest.length)
				return
			SoundMgr.#disabled = false
			SoundIds.forEach(i=> Instance.set(i, Sound.createInstance(i)))
			Instance.forEach(i=> i.setPaused = bool=> i.paused = bool)
			resolve(true)
		})
	}
	set vol(vol)   {Sound.volume = isNum(vol)? vol/10 : this.vol}
	get vol()      {return Sound.volume * 10}
	get disabled() {return SoundMgr.#disabled}

	/** @param {string} id */
	isPlaying(id)  {return Instance.get(id)?.playState == Sound.PLAY_SUCCEEDED}

	/** @param {string} id */
	isFinished(id) {return Instance.get(id)?.playState == Sound.PLAY_FINISHED}

	/** @param {string} id */
	#configMerge(id, cfg={}) {
		const prefix = isStr(id) && id.match(/^\D+/)?.[0] || null
		return {...ConfigMap.get(prefix) || ConfigMap.get('_normal'), ...cfg}
	}

	/** @param {string} id */
	play(id, cfg={}) {
		if (this.disabled || !Instance.has(id))
			return
		if (isNum(cfg.duration))
			Instance.get(id)._duration = cfg.duration
		Instance.get(id).play(this.#configMerge(id, cfg))
	}

	/** @param {string[]} ids */
	stop(...ids) {
		ids.length == 0 && Sound.stop()
		ids.forEach(id=> Instance.get(id)?.stop())
		return this
	}

	/**
	 * @param {boolean} bool
	 * @param {string[]} ids
	 */
	paused(bool, ...ids) {
		ids.forEach(id=> Instance.get(id)?.setPaused(bool))
	}

	/** @param {boolean} bool */
	set allPaused(bool) {
		Instance.forEach(i=> i.paused = bool)
	}
}freeze(SoundMgr)