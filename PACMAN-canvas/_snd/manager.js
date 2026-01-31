const {Sound:SoundJS}= createjs

/** @template {string} T */
export class SoundMgr {
	#loaded   = false
	#disabled = true
	#instance = /**@type {{[key in T]:createjs.AbstractSoundInstance}}*/({})

	/** @private @readonly */setup
	/** @private @readonly */optsMap

	/**
	 @param {{onLoaded():void,onFailed():void}} setup
     @param {Object[]} manifest
     @param {T[]} ids
     @param {ReadonlyMap<string,{loop:number,volume:number}>} optsMap
    */
	constructor(setup, manifest, ids, optsMap) {
		this.setup  = setup
		this.optsMap = optsMap
		new Promise((resolve,reject)=> {
			let amount = 0;
			SoundJS.registerSounds(manifest)
			SoundJS.on('fileerror', reject)
			SoundJS.on('fileload', ()=> {
				if (++amount < manifest.length) return
				ids.forEach(i=> this.#instance[i] = SoundJS.createInstance(i))
				resolve('All sound files loaded')
				this.#disabled = false
			})
		})
		.then (()=> this.onLoaded())
		.catch(()=> this.onFailed())
	}
	onLoaded() {
		this.#loaded = true
		this.setup.onLoaded()
	}
	onFailed() {
		this.#loaded = false
		this.setup.onFailed()
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
		return {...this.optsMap.get(prefix) ?? this.optsMap.get('_normal'), ...opts}
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
	 @param {{duration?:number,loop?:number}} opts
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
		if (this.disabled) return
		ids.length == 0 && SoundJS.stop()
		ids.forEach(id=> this.#instance[id].stop())
		return this
	}
}