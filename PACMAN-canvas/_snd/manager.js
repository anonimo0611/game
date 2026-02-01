const {Sound:SoundJS}= createjs
/**
 @typedef {{startTime:number,duration:number,volume?:number,loop?:number}} ManifestOpts
 @typedef {{interrupt?:string,delay?:number,duration?:number,offset?:number,loop?:number,volume?:number,pan?:number}} PlayOpts
*/
/**
 @template T
 @typedef {{src:string,data:{channels:number,audioSprite:({id:T} & ManifestOpts)[]}}[]} Manifest
*/

/** @template {string} T */
export class SoundMgr {
	#loaded   = false
	#disabled = true
	#instance = /**@type {{[K in T]:createjs.AbstractSoundInstance}}*/({})

	/** @private @readonly */opts
	/**
	 @param {{onLoaded?():void,onFailed?():void}} setup
     @param {{manifest:Manifest<T>,opts:{[key in T]:ManifestOpts}}} manifest
    */
	constructor(setup={}, {manifest,opts}) {
		this.opts = opts
		const ids = typedKeys(opts)
		new Promise((resolve,reject)=> {
			let amount = 0;
			SoundJS.registerSounds(manifest)
			SoundJS.on('fileerror', reject)
			SoundJS.on('fileload', ()=> {
				if (++amount < manifest.length) return
				ids.forEach(id=> {
					this.#instance[id] = SoundJS.createInstance(id)
					const
					self = /**@type {any}*/(this)
					self[`play${id}`] = (opts={})=> this.play(id,opts)
					self[`stop${id}`] = ()=> this.stop(id)
				})
				resolve('All sound files loaded')
				this.#disabled = false
			})
		})
		.then (()=> {
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

	/** @param {T} id */
	isPlaying(id)  {return this.#instance[id]?.playState === SoundJS.PLAY_SUCCEEDED}

	/** @param {T} id */
	isFinished(id) {return this.#instance[id]?.playState === SoundJS.PLAY_FINISHED}

	/** @param {T} id */
	#mergeOpts(id, opts={}) {
		const prefix = id.match(/^\D+/)?.[0] || ''
		return {...this.opts[id], ...opts}
	}

	/**
	 @param {boolean} enable
	 @param {...T} ids
	*/
	pause(enable, ...ids) {
		if (this.disabled) return
		ids.length
			? ids.forEach(id=> {this.#instance[id].paused=enable})
			: values(this.#instance).forEach(i=> i.paused=enable)
	}

	/**
	 @param {T} id
	 @param {PlayOpts} opts
	*/
	play(id, opts={}) {
		if (this.disabled) return
		if (typeof(opts.duration) == 'number' && opts.duration > 0)
			this.#instance[id].duration = opts.duration
		this.#instance[id].play(this.#mergeOpts(id, opts))
	}

	/**
	 @param {...T} ids
	*/
	stop(...ids) {
		if (this.disabled) return this
		ids.length == 0 && SoundJS.stop()
		ids.forEach(id=> this.#instance[id].stop())
		return this
	}
}