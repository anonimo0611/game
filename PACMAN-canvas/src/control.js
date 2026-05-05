import {Dir}      from '../_lib/direction.js'
import {Sound}    from '../_snd/sound.js'
import {Confirm}  from '../_lib/confirm.js'
import {State}    from './state.js'
import {Score}    from './score.js'
import {drawText} from './message.js'
import {Form,Menu,btns,getInput} from './ui.js'

const SETTINGS_KEY = 'anopacman'
const {InfoTexts:palette}= Color

const CfgD = new class ConfigData {
	speed         = 1
	powEnabled    = true
	currentOnly   = false
	alwaysChase   = false
	unrestricted  = false
	invincible    = false
	showTargets   = false
	showPaths     = false
	showGridLines = false
}

export const Ctrl = new class Controller {
	static {$(this.setup)}
	static setup() {
		Ctrl.#restore()
		Ctrl.#output()
		Ctrl.#setupGrid()
		Ctrl.#setupCtrls()
		$win.on({keydown:Ctrl.#onKeydown})
	}
	#anyFocused = false
	get extendScore()  {return +Menu.Extend.value}
	get showTracking() {return CfgD.showTargets || CfgD.showPaths}
	get semiTransPac() {return CfgD.invincible  || CfgD.showGridLines}
	get usingCheats()  {return CfgD.invincible  || CfgD.speed<.7 || Ctrl.showTracking}
	get isCaptured()   {return Ctrl.#anyFocused || Confirm.opened}
	get isPractice()   {return Ctrl.usingCheats ||!Ctrl.isArcadeMode}
	get isArcadeMode() {return CfgD.currentOnly == false && !Menu.Level.index}

	/** @param {boolean} [force] */
	pause(force) {
		if (State.isTitle || State.isAttract) return
		if (State.isInGame && force == false) return
		Sound.pause( Ticker.pause(force) )
	}
	#save() {
		const data = /**@type {any}*/(CfgD)
		keys(Menu).forEach(id=> data[id] = Menu[id].index)
		document.querySelectorAll('input').forEach(input=> {
			switch(input.type) {
			case 'range':   data[input.id] = input.valueAsNumber;break
			case 'checkbox':data[input.id] = input.checked;break
			}
		})
		localStorage[SETTINGS_KEY] = JSON.stringify(data)
	}
	#restore() {
		if (!localStorage[SETTINGS_KEY]) return
		const data = JSON.parse(localStorage[SETTINGS_KEY])
		keys(Menu).forEach(id=> Menu[id].index = data[id])
		document.querySelectorAll('input').forEach(input=> {
			switch(input.type) {
			case 'range':   input.value   = data[input.id];break
			case 'checkbox':input.checked = data[input.id];break
			}
		})
	}
	#output() {
		const spd = 'x'+CfgD.speed.toFixed(1), lh = 0.9
		const opt = {ctx:HUD, size:T*0.68, scaleX:0.7, style:'bold'}
		Ctrl.#save()
		Ctrl.#toggleGrid()
		HUD.save()
		HUD.translate(T*0.1, T*17.25)
		HUD.clearRect(0, 0, BW, T*3)
		if (spd != 'x1.0' || CfgD.invincible || CfgD.showTargets) {
			drawText(0, lh*0, palette[+(spd != 'x1.0') ], 'Speed'+spd, opt)
			drawText(0, lh*1, palette[+CfgD.invincible ], 'Invincible',opt)
			drawText(0, lh*2, palette[+CfgD.showTargets], 'Show Tgts', opt)
		}
		if (CfgD.showPaths || CfgD.unrestricted) {
			HUD.translate(T*(COLS-5), 0)
			drawText(0, 0, palette[+CfgD.showPaths],   'Show Paths', opt)
			drawText(0,lh, palette[+CfgD.unrestricted],'Ghosts Un-\nrestricted', opt)
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
			null, ()=> Score.clear(), 'Cancel','Clear')
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
			if (Ctrl.#anyFocused || !Sound.settled) return
			if (Dir.from(e,{wasd:true}) || e.key == '\x20') {
				State.isTitle && btns.start.click()
				Ticker.paused && Ctrl.pause()
			}
		}
	}
	#toggleGrid() {
		Grid.canvas.style.opacity = String(+CfgD.showGridLines)
	}
	#setupGrid() {
		Grid.beginPath()
		for(let x=1; x<COLS; x++) Grid.setLinePath([T*x, 0],[T*x, BH])
		for(let y=0; y<ROWS; y++) Grid.setLinePath([0, T*y],[BW, T*y])
		Grid.strokeStyle = Color.GridLine
		Grid.stroke()
	}
	#trackInputFocus() {
		$(document.body).on('focusin focusout', e=> {
			const isStartBtn = (e.target == btns.start)
			Ctrl.#anyFocused = (e.type == 'focusin') && !isStartBtn
		})
	}
	#setupCtrls() {
		Ctrl.#trackInputFocus()
		values(Menu).forEach(m=> m.onChange(Ctrl.#save))
		$('input')   .on({input:Ctrl.#output})
		$(btns.clear).on({click:Ctrl.#clearHiConfirm})
		$(btns.reset).on({click:Ctrl.#reset})
		$(btns.start).on({click:State.setNewGame})
		$root.addClass('controller-settled')
	}
}
,powChk = getInput('powEnabled')
,Cfg = /**@type {Readonly<CfgD>}*/(CfgD)