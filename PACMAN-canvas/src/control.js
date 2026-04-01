import {Dir}      from '../_lib/direction.js'
import {Sound}    from '../_snd/sound.js'
import {Confirm}  from '../_lib/confirm.js'
import {State}    from './state.js'
import {drawText} from './message.js'
import {ScoreMgr} from './score.js'
import {Form,Menu,inputs,btns} from './ui.js'

const SettingsKey = 'anopacman'
const {Info:palette}= Palette

export const Ctrl = new class Controller {
	static {$(this.setup)}
	static setup() {
		Ctrl.#restore()
		Ctrl.#output()
		Ctrl.#setupGrid()
		Ctrl.#setupCtrls()
		$win.on({keydown:Ctrl.#onKeydown})
	}
	get activeElem()    {return qS(`:not(#${btns.start.id}):focus`)}
	get extendScore()   {return Number(Menu.Extend.value)}
	get livesMax()      {return inputs.lvsRng.valueAsNumber}
	get speed()         {return inputs.spdRng.valueAsNumber}
	get endlessMode()   {return inputs.onlChk.checked == false}
	get alwaysChase()   {return inputs.chsChk.checked}
	get unrestricted()  {return inputs.unrChk.checked}
	get invincible()    {return inputs.invChk.checked}
	get showTargets()   {return inputs.tgtChk.checked}
	get showPaths()     {return inputs.pthChk.checked}
	get showGridLines() {return inputs.grdChk.checked}
	get showTracking()  {return Ctrl.showTargets || Ctrl.showPaths}
	get semiTransPac()  {return Ctrl.invincible  || Ctrl.showGridLines}
	get usingCheats()   {return Ctrl.invincible  || Ctrl.speed<.7 || Ctrl.showTracking}
	get isPractice()    {return Ctrl.usingCheats ||!Ctrl.isArcadeMode}
	get isArcadeMode()  {return Ctrl.endlessMode && Menu.Level.index == 0}

	/** @param {boolean} [force] */
	pause(force) {
		if (State.isTitle || State.isAttract) return
		if (State.isInGame && force == false) return
		Sound.pause( Ticker.pause(force) )
	}
	#save() {
		const data = Object.create(null)
		typedKeys(Menu).forEach(id=> data[id] = Menu[id].index)
		document.querySelectorAll('input').forEach(input=> {
			switch(input.type) {
			case 'range':   data[input.id] = input.value;  break
			case 'checkbox':data[input.id] = input.checked;break
			}
		})
		localStorage[SettingsKey] = JSON.stringify(data)
	}
	#restore() {
		if (!localStorage[SettingsKey]) return
		const data = JSON.parse(localStorage[SettingsKey])
		typedKeys(Menu).forEach(id=> Menu[id].index = data[id])
		document.querySelectorAll('input').forEach(input=> {
			switch(input.type) {
			case 'range':   input.value   = data[input.id];break
			case 'checkbox':input.checked = data[input.id];break
			}
		})
	}
	#output() {
		const spd = 'x'+Ctrl.speed.toFixed(1), lh = 0.9
		const opt = {ctx:HUD, size:T*0.68, scaleX:0.7, style:'bold'}
		Ctrl.#save()
		Ctrl.#toggleGrid()
		HUD.save()
		HUD.translate(T*0.1, T*17.25)
		HUD.clearRect(0, 0, BW, T*3)
		if (spd != 'x1.0' || Ctrl.invincible || Ctrl.showTargets) {
			drawText(0, lh*0, palette[+(spd != 'x1.0') ], 'Speed'+spd, opt)
			drawText(0, lh*1, palette[+Ctrl.invincible ], 'Invincible',opt)
			drawText(0, lh*2, palette[+Ctrl.showTargets], 'Show Tgts', opt)
		}
		if (Ctrl.showPaths || Ctrl.unrestricted) {
			HUD.translate(T*(Cols-5), 0)
			drawText(0, 0, palette[+Ctrl.showPaths],   'Show Paths', opt)
			drawText(0,lh, palette[+Ctrl.unrestricted],'Ghosts Un-\nrestricted', opt)
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
			? State.setQuit()
			: State.isInGame && Ctrl.#quitConfirm()
	}
	#clearHiConfirm() {
		Confirm.open('Are you sure you want to clear high-score?',
			null, ()=> ScoreMgr.clear(), 'Cancel','Clear')
	}
	#quitConfirm() {
		!Ticker.paused && Ctrl.pause()
		Confirm.open('Are you sure you want to quit the game?',
			Ctrl.pause, ()=> State.setQuit(), 'Resume','Quit')
	}
	#onKeydown(/**@type {JQKeyboardEvent}*/e) {
		if (keyRepeat(e) || Confirm.opened) return
		switch(e.key) {
		case 'Escape': return Ctrl.pause()
		case 'Delete': return Ctrl.#quit(e.ctrlKey)
		default:
			if (Ctrl.activeElem || !Sound.settled) return
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
		Grid.strokeStyle = Color.Grid
		range(1,Cols).forEach(y=> Grid.strokeLine(T*y, 0, T*y, Rows*T))
		range(0,Rows).forEach(x=> Grid.strokeLine(0, T*x, Cols*T, T*x))
	}
	#setupCtrls() {
		values(Menu).forEach(m=> m.onChange(Ctrl.#save))
		$('input')   .on({input:Ctrl.#output})
		$(btns.clear).on({click:Ctrl.#clearHiConfirm})
		$(btns.reset).on({click:Ctrl.#reset})
		$(btns.start).on({click:()=> State.setIntro()})
		$(btns.demo) .on({click:()=> State.setAttract()})
		$(btns.coff1).on({click:()=> State.setCoffBreak({data:1})})
		$(btns.coff2).on({click:()=> State.setCoffBreak({data:2})})
		$(btns.coff3).on({click:()=> State.setCoffBreak({data:3})})
		$root.addClass('ui-initialized')
	}
}, powChk = inputs.powChk