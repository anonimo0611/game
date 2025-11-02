import {Dir}      from '../_lib/direction.js'
import {Sound}    from '../_snd/sound.js'
import {Confirm}  from '../_lib/confirm.js'
import {Menu}     from './ui.js'
import {MenuIds}  from './ui.js'
import {State}    from './state.js'
import {Score}    from './score.js'
import {drawText} from './message.js'

export const Form = document.forms[0]

/** @param {string} id */
export const ctrl = id=> /**@type {HTMLInputElement}*/(byId(id))

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
	get extendPts()     {return +Menu.Extend.value}
	get activeElem()    {return qS(':not(#startBtn):focus')}
	get livesMax()      {return ctrl('lvsRng').valueAsNumber}
	get speedRate()     {return ctrl('spdRng').valueAsNumber}
	get isChaseMode()   {return ctrl('chsChk').checked}
	get consecutive()   {return ctrl('onlChk').checked == false}
	get unrestricted()  {return ctrl('unrChk').checked}
	get invincible()    {return ctrl('invChk').checked}
	get showTargets()   {return ctrl('tgtChk').checked}
	get showGridLines() {return ctrl('grdChk').checked}
	get isPractice()    {return this.isCheatMode  ||!this.isDefaultMode}
	get isCheatMode()   {return this.speedRate<.7 || this.showTargets || this.invincible}
	get isDefaultMode() {return this.consecutive && Menu.Level.index == 0}

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
		const{ctx}= HUD, lh = 0.84, ColTbl = Color.InfoTexts
		const spd = 'x'+Ctrl.speedRate.toFixed(1)
		const cfg = {ctx, size:T*0.68, style:'bold', scaleX:.7}
		ctx.save()
		ctx.translate(T*0.1, T*18)
		ctx.clearRect(0, -T, BW, T*3)
		if (Ctrl.isCheatMode || spd != 'x1.0') {
			drawText(0, lh*0, ColTbl[+(spd != 'x1.0') ], 'Speed'+spd,  cfg)
			drawText(0, lh*1, ColTbl[+Ctrl.invincible ], 'Invincible', cfg)
			drawText(0, lh*2, ColTbl[+Ctrl.showTargets], 'Targets',    cfg)
		}
		if (Ctrl.unrestricted) {
			ctx.translate(T*(Cols-5), T/2)
			drawText(0, 0, ColTbl[1], 'Un-\nrestricted', cfg)
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
		if (Confirm.opened || keyRepeat(e)) return
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
}, powChk = ctrl('powChk')