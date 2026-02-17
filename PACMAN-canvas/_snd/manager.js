const {Sound:SoundJS}= createjs
/**
 @import {Sound} from './_sound.d'
 @template {string} S
*/
export class SoundMgr {
	#loaded   = false
	#disabled = true
	#playOpts = /**@type {{[K in S]:Readonly<Sound.Data<S>>}}*/({})
	#instance = /**@type {{[K in S]:createjs.AbstractSoundInstance}}*/({})
	/**
	 @param {Sound.Setup} setup
	 @param {Sound.Manifest<S>} m
	*/
	constructor(setup={}, m) {
		new Promise((resolve,reject)=> {
			let amount = 0
			m.flat().forEach(s=> s.data.audioSprite.forEach(d=> this.#playOpts[d.id]=d))
			SoundJS.registerSounds(/**@type {object[]}*/(m))
			SoundJS.on('fileerror', reject)
			SoundJS.on('fileload', ()=> {
				if (++amount < m.length) return
				typedKeys(this.#playOpts).forEach(id=> {
					const
					self = /**@type {any}*/(this)
					self[`play${id}`]  = (opts={})=> this.play(id,opts)
					self[`stop${id}`]  = ()=> this.stop(id)
					this.#instance[id] = SoundJS.createInstance(id)
				})
				resolve('succeed')
				this.#disabled = false
			})
		})
		.then(()=> {
			this.#loaded = true
			setup.onLoaded?.()
		})
		.catch(()=> {
			this.#loaded = false
			setup.onFailed?.()
		})
	}
	get loaded()   {return this.#loaded}
	get disabled() {return this.#disabled}
	get vol()      {return SoundJS.volume * 10}
	set vol(vol)   {SoundJS.volume = Number.isFinite(vol)? vol/10 : this.vol}

	/** @param {S} id */
	isPlaying(id)  {return this.#instance[id]?.playState === SoundJS.PLAY_SUCCEEDED}

	/** @param {S} id */
	isFinished(id) {return this.#instance[id]?.playState === SoundJS.PLAY_FINISHED}

	/**
	 @param {S} id
	 @param {Readonly<Sound.Opts>} opts
	*/
	#mergeOpts(id, opts) {
		return {...this.#playOpts[id], ...opts}
	}

	/**
	 @param {boolean} enable
	 @param {S[]} ids
	*/
	pause(enable, ...ids) {
		if (this.disabled) return
		ids.length
			? ids.forEach(id=> {this.#instance[id].paused=enable})
			: values(this.#instance).forEach(i=> i.paused=enable)
	}

	/**
	 @param {S} id
	 @param {Readonly<Sound.Opts>} opts
	*/
	play(id, opts={}) {
		if (this.disabled) return
		if (typeof(opts.duration) == 'number' && opts.duration > 0)
			this.#instance[id].duration = opts.duration
		this.#instance[id].play(this.#mergeOpts(id,opts))
	}

	/**
	 @param {S[]} ids
	*/
	stop(...ids) {
		if (this.disabled) return this
		ids.length == 0 && SoundJS.stop()
		ids.forEach(id=> this.#instance[id].stop())
		return this
	}
}