import {Dir}      from '../_lib/direction.js'
import {Sound}    from '../_snd/sound.js'
import {Confirm}  from '../_lib/confirm.js'
import {Menu}     from './ui.js'
import {MenuIds}  from './ui.js'
import {State}    from './state.js'
import {drawText} from './message.js'
import {Score}    from './score.js'
import {inputs,btns} from './inputs.js'

export const Form = document.forms[0]
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
	get activeElem()    {return qS(`:not(#${btns.start.id}):focus`)}
	get livesMax()      {return inputs.lvsRng.valueAsNumber}
	get speed()         {return inputs.spdRng.valueAsNumber}
	get endlessMode()   {return inputs.onlChk.checked == false}
	get alwaysChase()   {return inputs.chsChk.checked}
	get unrestricted()  {return inputs.unrChk.checked}
	get invincible()    {return inputs.invChk.checked}
	get showTargets()   {return inputs.tgtChk.checked}
	get showGridLines() {return inputs.grdChk.checked}
	get semiTransPac()  {return this.invincible  || this.showGridLines}
	get usingCheats()   {return this.invincible  || this.speed<.7 || this.showTargets}
	get isPractice()    {return this.usingCheats || !this.isArcadeMode}
	get isArcadeMode()  {return this.endlessMode && !Menu.Level.index}

	/** @param {boolean} [force] */
	pause(force) {
		State.isInGame && Sound.pause( Ticker.pause(force) )
	}
	#fitToViewport() {
		const scale = min(
			innerWidth /Form.offsetWidth*.98,
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
			} $(input).trigger('input')
		})
	}
	#output() {
		const spd = 'x'+Ctrl.speed.toFixed(1), lh = 0.9
		const opt = {ctx:HUD, size:T*0.68, scaleX:0.7, style:'bold'}
		Ctrl.#save()
		Ctrl.#toggleGrid()
		HUD.save()
		HUD.translate(T*0.1, T*18)
		HUD.clearRect(0, -T, BW, T*3)
		if (Ctrl.usingCheats || spd != 'x1.0') {
			drawText(0, lh*0, Palette.Info[+(spd != 'x1.0') ], 'Speed'+spd, opt)
			drawText(0, lh*1, Palette.Info[+Ctrl.invincible ], 'Invincible',opt)
			drawText(0, lh*2, Palette.Info[+Ctrl.showTargets], 'Targets',   opt)
		}
		if (Ctrl.unrestricted) {
			HUD.translate(T*(Cols-5), T/2)
			drawText(0,0, Palette.Info[1], 'Un-\nrestricted', opt)
		}
		HUD.restore()
	}
	#reset() {
		Form.reset()
		Ctrl.#output()
		Ctrl.#restore()
	}
	#quit(noConfirm=false) {
		if (State.isTitle)
			return
		noConfirm
			? State.toQuit()
			: State.isInGame && Ctrl.#quitConfirm()
	}
	#clearHiScore() {
		localStorage.removeItem('anopac_hiscore')
		Score.reset()
	}
	#clearHiConfirm() {
		Confirm.open('Are you sure you want to clear high-score?',
			null, Ctrl.#clearHiScore, 'Cancel','Clear')
	}
	#quitConfirm() {
		!Ticker.paused && Ctrl.pause()
		Confirm.open('Are you sure you want to quit the game?',
			Ctrl.pause, ()=> State.toQuit(), 'Resume','Quit')
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
			if (Dir.from(e,{wasd:true}) || e.key == '\x20') {
				State.isTitle && btns.start.click()
				Ticker.paused && Ctrl.pause()
			}
		}
	}
	#toggleGrid() {
		Grid.canvas.style.opacity = String(+Ctrl.showGridLines)
	}
	#setupGrid() {
		Grid.strokeStyle = Colors.Grid
		for (const y of range(1,Cols)) Grid.strokeLine(T*y, 0, T*y, Rows*T)
		for (const x of range(0,Rows)) Grid.strokeLine(0, T*x, Cols*T, T*x)
	}
	#setup() {
		Ctrl.#setupGrid()
		values(Menu).forEach(m=> m.onChange(Ctrl.#save))
		$win.on({resize:Ctrl.#fitToViewport})
		$('input')   .on({input:Ctrl.#output})
		$(btns.clear).on({click:Ctrl.#clearHiConfirm})
		$(btns.reset).on({click:Ctrl.#reset})
		$(btns.start).on({click:()=> State.toIntro()})
		$(btns.demo) .on({click:()=> State.toAttract()})
		$(btns.coff1).on({click:()=> State.toCoffBreak({data:1})})
		$(btns.coff2).on({click:()=> State.toCoffBreak({data:2})})
		$(btns.coff3).on({click:()=> State.toCoffBreak({data:3})})
		$(Form).attr('data-ready-state','loaded')
	}
}, powChk = inputs.powChk