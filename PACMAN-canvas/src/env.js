import {Dir}      from '../_lib/direction.js'
import {Confirm}  from '../_lib/confirm.js'
import {Sound}    from '../_snd/sound.js'
import {State}    from './state.js'
import {drawText} from './message.js'
import {Form,Menu,btns} from './ui.js'

const {InfoTexts:palette}= Color
const SETTINGS_KEY = 'anopacman'

export const Cfg = readOnly({
	speed:         1,
	currentOnly:   false,
	alwaysChase:   false,
	unrestricted:  false,
	invincible:    false,
	showTargets:   false,
	showPaths:     false,
	showGridLines: false,
})

export const Env = new class Environment {
	static {$(this.setup)}
	static setup() {
		Env.#restore()
		Env.#setupCtrls()
		$win.on({keydown:Env.#onKeydown})
	}
	#anyFocused = false
	get extendScore()  {return +Menu.Extend.value}
	get isStAboveLv1() {return  Menu.Level.index > 0}
	get isLowSpeed()   {return  Cfg.speed < 0.7}
	get isArcadeMode() {return !Cfg.currentOnly && !Menu.Level.index}
	get isPractice()   {return  Env.usingCheats || !Env.isArcadeMode}
	get isCaptured()   {return  Env.#anyFocused || Confirm.opened}
	get showTracking() {return  Cfg.showTargets || Cfg.showPaths}
	get semiTransPac() {return  Cfg.invincible  || Cfg.showGridLines}
	get usingCheats()  {return  Cfg.invincible  || Env.isLowSpeed || Env.showTracking}

	/** @readonly */
	window = function() {
		let f = +document.hasFocus()
		$win.on('blur', ()=> {f=0;Env.#pause(!f)})
		$win.on('focus',()=> {f=1;Env.#pause(!f)})
		return {get isActive(){return Boolean(f)}}
	}()

	/** @param {boolean} [force] */
	#pause(force) {
		if (State.isTitle || State.isAttract) return
		if (State.isInGame && force == false) return
		Sound.pause( Ticker.pause(force) )
	}
	#save() {
		const data = /**@type {Record<string,any>}*/(Cfg)
		getKeys(Menu).forEach(id=> data[id] = Menu[id].index)
		document.querySelectorAll('input').forEach(i=> {
			switch(i.type) {
			case 'range':   data[i.id] = i.valueAsNumber;break
			case 'checkbox':data[i.id] = i.checked;break
			}
		}),localStorage[SETTINGS_KEY] = JSON.stringify(data)
	}
	#restore() {
		if (!localStorage[SETTINGS_KEY]) return
		const data = JSON.parse(localStorage[SETTINGS_KEY])
		getKeys(Menu).forEach(id=> Menu[id].index = data[id])
		document.querySelectorAll('input').forEach(i=> {
			if (data[i.id] == undefined) return
			switch(i.type) {
			case 'range':   i.value   = data[i.id];break
			case 'checkbox':i.checked = data[i.id];break
			}
		})
	}
	#reset() {
		Form.reset()
		$('input').trigger('input')
	}
	#quit(noConfirm=false) {
		if (State.isTitle) return
		noConfirm
			? State.setQuit()
			: State.isInGame && Env.#quitConfirm()
	}
	#quitConfirm() {
		!Ticker.paused && Env.#pause()
		Confirm.open('Are you sure you want to quit the game?',
			['Resume',Env.#pause], ['Quit',State.setQuit])
	}
	#onKeydown(/**@type {JQKeyboardEvent}*/e) {
		if (keyRepeated(e) || Confirm.opened) return
		switch(e.key) {
		case 'Escape': return Env.#pause()
		case 'Delete': return Env.#quit(e.ctrlKey)
		default:
			if (Env.#anyFocused || !Sound.settled) return
			if (Dir.from(e,{wasd:true}) || e.key == '\x20') {
				State.isTitle && btns.start.click()
				Ticker.paused && Env.#pause()
			}
		}
	}
	async #output() {
		await Promise.resolve()
		Env.#save()
		Env.#syncHelpPanel()
		Env.#toggleGridLines()
		const
		spd = 'x'+Cfg.speed.toFixed(1), lh = 0.9,
		opt = {size:T*0.68, scaleX:0.7, style:'bold'}
		HUD.save()
		HUD.translate(T*0.1, T*17.25)
		HUD.clearRect(0, 0, BW, T*3)
		if (spd != 'x1.0' || Cfg.invincible || Cfg.showTargets) {
			drawText(HUD, 0, lh*0, palette[+(spd != 'x1.0')], 'Speed'+spd, opt)
			drawText(HUD, 0, lh*1, palette[+Cfg.invincible ], 'Invincible',opt)
			drawText(HUD, 0, lh*2, palette[+Cfg.showTargets], 'Show Tgts', opt)
		}
		if (Cfg.showPaths || Cfg.unrestricted) {
			HUD.translate(T*(COLS-5), 0)
			drawText(HUD, 0,  0, palette[+Cfg.showPaths],   'Show Paths', opt)
			drawText(HUD, 0, lh, palette[+Cfg.unrestricted],'Ghosts Un-\nrestricted', opt)
		}
		HUD.restore()
	}
	#syncHelpPanel() {
		const {isStAboveLv1,isLowSpeed}= Env
		const data = {...Cfg,isStAboveLv1,isLowSpeed}
		entries(data).forEach(([id,v])=> {
			$(`#_${id}`).css('color', palette[+v])
		})
	}
	#toggleGridLines() {
		Grid.canvas.dataset.show = String(Cfg.showGridLines)
	}
	#observeFocusChange() {
		$(document.body).on('focusin focusout', e=> {
			Env.#anyFocused = (e.type == 'focusin')
				&& (e.target != btns.start)
		})
	}
	#setupCtrls() {
		Env.#observeFocusChange()
		getVals(Menu).forEach(m=> m.onChange(Env.#output))
		$('input')   .on({input:Env.#output})
		$(btns.reset).on({click:Env.#reset})
		$(btns.start).on({click:State.setNewGame})
		$root.addClass('controller-settled')
	}
}