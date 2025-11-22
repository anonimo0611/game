import {Dir}     from '../_lib/direction.js'
import {Sound}   from '../_snd/sound.js'
import {Confirm} from '../_lib/confirm.js'
import {Menu}    from './ui.js'
import {MenuIds} from './ui.js'
import {State}   from './state.js'
import {print}   from './message.js'
import {Score}   from './score.js'

export const
	Form  = document.forms[0],
	input = (/**@type {string}*/id)=> {
		let element = byId(id)
		if (element instanceof HTMLInputElement) return element
		throw TypeError(`There is no input element with the ID “${id}”.`)
	}

export const Ctrl = new class {
	static {$(this.setup)}
	static setup() {
		$win.on({
			blur:_=> Ctrl.pause(true),
			load:    Ctrl.#setup,
			keydown: Ctrl.#onKeydown,
		})
		Ctrl.#restore()
		Ctrl.#output()
		Ctrl.#fitToViewport()
	}
	get extendScore()   {return +Menu.Extend.value}
	get activeElem()    {return qS(':not(#startBtn):focus')}
	get livesMax()      {return input('lvsRng').valueAsNumber}
	get speed()         {return input('spdRng').valueAsNumber}
	get consecutive()   {return input('onlChk').checked == false}
	get alwaysChase()   {return input('chsChk').checked}
	get unrestricted()  {return input('unrChk').checked}
	get invincible()    {return input('invChk').checked}
	get showTargets()   {return input('tgtChk').checked}
	get showGridLines() {return input('grdChk').checked}
	get usingCheats()   {return this.speed<.7 || this.showTargets || this.invincible}
	get isArcadeMode()  {return this.consecutive && Menu.Level.index == 0}
	get isPractice()    {return this.usingCheats || !this.isArcadeMode}

	/** @param {boolean} [force] */
	pause(force) {
		State.isPlaying && Sound.pause(Ticker.pause(force))
	}
	#fitToViewport() {
		const scale = min(
			innerWidth /Form.offsetWidth * .98,
			innerHeight/Form.offsetHeight)
		Form.style.scale = min(1, scale).toFixed(2)
	}
	#save() {
		const data = Object.create(null)
		MenuIds.forEach(id=> data[id] = Menu[id].index)
		document.querySelectorAll('input').forEach(input=> {
			switch(input.type) {
			case 'range':   data[input.id] = input.value;  break
			case 'checkbox':data[input.id] = input.checked;break
			}
		})
		localStorage.anopacman = JSON.stringify(data)
	}
	#restore() {
		if (!localStorage.anopacman) return
		const data = JSON.parse(localStorage.anopacman)
		MenuIds.forEach(id=> Menu[id].index = data[id])
		document.querySelectorAll('input').forEach(input=> {
			switch(input.type) {
			case 'range':   input.value   = data[input.id];break
			case 'checkbox':input.checked = data[input.id];break
			}$(input).trigger('input')
		})
	}
	#output() {
		Ctrl.#save()
		const{ctx}=HUD, h=0.84, spd=`x${Ctrl.speed.toFixed(1)}`
		const cfg={ctx, size:T*0.68, scaleX:0.7, style:'bold'}
		ctx.save()
		ctx.translate(T*0.1, T*18)
		ctx.clearRect(0,-T,BW,T*3)
		if (Ctrl.usingCheats || spd != 'x1.0') {
			print(0, h*0, Color.Inf[+(spd != 'x1.0') ], 'Speed'+spd, cfg)
			print(0, h*1, Color.Inf[+Ctrl.invincible ], 'Invincible',cfg)
			print(0, h*2, Color.Inf[+Ctrl.showTargets], 'Targets',   cfg)
		}
		if (Ctrl.unrestricted) {
			ctx.translate(T*(Cols-5), T/2)
			print(0,0, Color.Inf[1], 'Un-\nrestricted', cfg)
		}
		ctx.restore()
	}
	#reset() {
		Form.reset()
		Ctrl.#output()
		Ctrl.#restore()
	}
	#quit(noConfirm=false) {
		noConfirm
			? State.to('Quit')
			: State.isPlaying && Ctrl.#quitConfirm()
	}
	#clearHiScore() {
		localStorage.removeItem('anopac_hiscore')
		Score.reset()
	}
	#clearHiConfirm() {
		Confirm.open('Are you sure you want to clear high-score?',
			null, Ctrl.#clearHiScore, 'No','Yes', 0)
	}
	#quitConfirm() {
		!Ticker.paused && Ctrl.pause()
		Confirm.open('Are you sure you want to quit the game?',
			Ctrl.pause, ()=> State.to('Quit'), 'Resume','Quit', 0)
	}
	/** @param {KeyboardEvent} e */
	#onKeydown(e) {
		if (Confirm.opened || keyRepeat(e))
			return
		switch(e.key) {
		case 'Escape': return Ctrl.pause()
		case 'Delete': return Ctrl.#quit(e.ctrlKey)
		default:
			if (Ctrl.activeElem) return
			if (Dir.from(e,{wasd:true}) || e.key=='\x20') {
				State.isTitle && byId('startBtn')?.click()
				Ticker.paused && Ctrl.pause()
			}
		}
	}
	#setup() {
		for (const menu of values(Menu)) {
			menu.on({change:Ctrl.#save})
		}
		$win.on({resize:Ctrl.#fitToViewport})
		$('input')    .on({input:Ctrl.#output})
		$('#clearHi') .on({click:Ctrl.#clearHiConfirm})
		$('#resetBtn').on({click:Ctrl.#reset})
		$('#startBtn').on({click:()=> State.to('Start')})
	}
}, powChk = input('powChk')