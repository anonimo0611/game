import {Dir}      from '../_lib/direction.js'
import {Sound}    from '../_snd/sound.js'
import {Confirm}  from '../_lib/confirm.js'
import {State}    from './state.js'
import {drawText} from './message.js'
import {Score}    from './score.js'
import {Menu,inputs,btns} from './ui.js'

const UserSettingsKey = 'anopacman'

export const Form = document.forms[0]
export const Ctrl = new class {
	constructor() {
		$win.on({
			load:   this.#onLoad,
			keydown:this.#onKeydown,
		})
	}
	#onLoad = ()=> {
		this.#restore()
		this.#output()
		this.#fitToViewport()
		this.#setup()
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
	get showTracking()  {return this.showTargets || this.showPaths}
	get semiTransPac()  {return this.invincible  || this.showGridLines}
	get usingCheats()   {return this.invincible  || this.speed<.7  || this.showTracking}
	get isPractice()    {return this.usingCheats || !this.isArcadeMode}
	get isArcadeMode()  {return this.endlessMode && !Menu.Level.index}

	/** @param {boolean} [force] */
	pause(force) {
		if (State.isTitle || State.isAttract) return
		if (State.isInGame && force == false) return
		Sound.pause( Ticker.pause(force) )
	}
	#fitToViewport() {
		const scale = min(
			innerWidth /Form.offsetWidth*.98,
			innerHeight/Form.offsetHeight)
		Form.style.scale = min(1, scale).toFixed(2)
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
		localStorage[UserSettingsKey] = JSON.stringify(data)
	}
	#restore() {
		if (!localStorage[UserSettingsKey]) return
		const data = JSON.parse(localStorage[UserSettingsKey])
		typedKeys(Menu).forEach(id=> Menu[id].index = data[id])
		document.querySelectorAll('input').forEach(input=> {
			switch(input.type) {
			case 'range':   input.value   = data[input.id];break
			case 'checkbox':input.checked = data[input.id];break
			} $(input).trigger('input')
		})
	}
	#output = ()=> {
		const spd = 'x'+this.speed.toFixed(1), lh = 0.9
		const opt = {ctx:HUD, size:T*0.68, scaleX:0.7, style:'bold'}
		this.#save()
		this.#toggleGrid()
		HUD.save()
		HUD.translate(T*0.1, T*17.25)
		HUD.clearRect(0, 0, BW, T*3)
		if (spd != 'x1.0' || this.invincible || this.showTargets) {
			drawText(0, lh*0, Palette.Info[+(spd != 'x1.0') ], 'Speed'+spd, opt)
			drawText(0, lh*1, Palette.Info[+this.invincible ], 'Invincible',opt)
			drawText(0, lh*2, Palette.Info[+this.showTargets], 'Show Tgts', opt)
		}
		if (this.showPaths || this.unrestricted) {
			HUD.translate(T*(Cols-5), 0)
			drawText(0, lh*0, Palette.Info[+this.showPaths],   'Show Paths', opt)
			drawText(0, lh*1, Palette.Info[+this.unrestricted],'Ghosts Un-\nrestricted', opt)
		}
		HUD.restore()
	}
	#reset() {
		Form.reset()
		this.#output()
		this.#restore()
	}
	#quit(noConfirm=false) {
		if (State.isTitle)
			return
		noConfirm
			? State.setQuit()
			: State.isInGame && this.#quitConfirm()
	}
	#clearHiScore() {
		localStorage.removeItem(Score.HiScoreKey)
		Score.reset()
	}
	#clearHiConfirm() {
		Confirm.open('Are you sure you want to clear high-score?',
			null, this.#clearHiScore, 'Cancel','Clear')
	}
	#quitConfirm() {
		!Ticker.paused && this.pause()
		Confirm.open('Are you sure you want to quit the game?',
			this.pause, ()=> State.setQuit(), 'Resume','Quit')
	}
	#onKeydown = (/**@type {JQKeyboardEvent}*/e)=> {
		if (keyRepeat(e) || Confirm.opened)
			return
		switch(e.key) {
		case 'Escape': return this.pause()
		case 'Delete': return this.#quit(e.ctrlKey)
		default:
			if (this.activeElem) return
			if (Dir.from(e,{wasd:true}) || e.key == '\x20') {
				State.isTitle && btns.start.click()
				Ticker.paused && this.pause()
			}
		}
	}
	#toggleGrid() {
		Grid.canvas.style.opacity = String(+this.showGridLines)
	}
	#setupGrid() {
		Grid.strokeStyle = Colors.Grid
		for (const y of range(1,Cols)) Grid.strokeLine(T*y, 0, T*y, Rows*T)
		for (const x of range(0,Rows)) Grid.strokeLine(0, T*x, Cols*T, T*x)
	}
	#setup() {
		this.#setupGrid()
		values(Menu).forEach(m=> m.onChange(this.#save))
		$win.on({resize:this.#fitToViewport})
		$('input')   .on({input:this.#output})
		$(btns.clear).on({click:this.#clearHiConfirm})
		$(btns.reset).on({click:this.#reset})
		$(btns.start).on({click:()=> State.setIntro()})
		$(btns.demo) .on({click:()=> State.setAttract()})
		$(btns.coff1).on({click:()=> State.setCoffBreak({data:1})})
		$(btns.coff2).on({click:()=> State.setCoffBreak({data:2})})
		$(btns.coff3).on({click:()=> State.setCoffBreak({data:3})})
		$(Form).attr('data-ready-state','loaded')
	}
}, powChk = inputs.powChk