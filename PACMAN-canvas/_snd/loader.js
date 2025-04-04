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
			if (++amount < Manifest.length) return
			SoundMgr.#disabled = false
			SoundIds.forEach(i=> Instance.set(i, Sound.createInstance(i)))
			Instance.forEach(i=> i.setPaused = bool=> i.paused = bool)
			resolve(true)
		})
	}
	set vol(vol)   {Sound.volume = isNum(vol)? vol/10 : this.vol}
	get vol()      {return Sound.volume * 10}
	get disabled() {return SoundMgr.#disabled}
	isPlaying(id)  {return Instance.get(id)?.playState == Sound.PLAY_SUCCEEDED}
	isFinished(id) {return Instance.get(id)?.playState == Sound.PLAY_FINISHED}

	#configMerge(id, cfg={}) {
		const prefix = isStr(id) && id.match(/^\D+/)?.[0] || null
		return {...ConfigMap.get(prefix) || ConfigMap.get('_normal'), ...cfg}
	}
	play(id, cfg={}) {
		if (this.disabled || !Instance.has(id))
			return
		if (isNum(cfg.duration))
			Instance.get(id)._duration = cfg.duration
		Instance.get(id).play(this.#configMerge(id, cfg))
	}
	stop(...ids) {
		ids.length == 0 && Sound.stop()
		ids.forEach(id=> Instance.get(id)?.stop())
		return this
	}
	pause(id) {
		arguments.length
			? Instance.get(id)?.setPaused(true)
			: Instance.forEach(i=> i.paused = true)
	}
	resume(id) {
		arguments.length
			? Instance.get(id)?.setPaused(false)
			: Instance.forEach(i=> i.paused = false)
	}
	pauseAll(bool) {
		bool? this.pause()
			: this.resume()
	}
}freeze(SoundMgr)