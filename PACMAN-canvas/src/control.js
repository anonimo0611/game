import {Menu}     from './ui.js'
import {MenuIds}  from './ui.js'
import {State}    from './state.js'
import {drawText} from './message.js'

export const Form = document.forms[0]

/** @param {string} id */
export const ctrl = id=> /**@type {HTMLInputElement}*/(byId(id))

export const Ctrl = new class {
	static {$(this.setup)}
	static setup() {
		Ctrl.#restore()
		Ctrl.#output()
		Ctrl.#fitToViewport()
		$load(Ctrl.#setup)
	}
	get extendPts()     {return +Menu.Extend.value}
	get focused()       {return qS(':not(#startBtn):focus')}
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
			match(input.type, {
			range:   ()=> {data[input.id] = input.value},
			checkbox:()=> {data[input.id] = input.checked},
			})
		})
		localStorage.anopacman = JSON.stringify(data)
	}
	#restore() {
		if (!localStorage.anopacman) return
		const data = JSON.parse(localStorage.anopacman)
		MenuIds.forEach(id=> Menu[id].index = data[id])
		document.querySelectorAll('input').forEach(input=> {
			match(input.type, {
			range:   ()=> {input.value   = data[input.id]},
			checkbox:()=> {input.checked = data[input.id]},
			})
			$(input).trigger('input')
		})
	}
	#reset() {
		Form.reset()
		Ctrl.#output()
		Ctrl.#restore()
	}
	#drawGridLines() {
		if (!Ctrl.showGridLines) return
		Ctx.save()
		Ctx.strokeStyle = Color.Grid
		for (const y of range(1,Cols)) Ctx.strokeLine(T*y, 0, T*y, Rows*T)
		for (const x of range(0,Rows)) Ctx.strokeLine(0, T*x, Cols*T, T*x)
		Ctx.restore()
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
	#setup() {
		for (const menu of values(Menu)) {
			menu.on({change:Ctrl.#output})
		}
		$win.on({resize:Ctrl.#fitToViewport})
		$('input')    .on({input:Ctrl.#output})
		$('#resetBtn').on({click:Ctrl.#reset})
		$('#startBtn').on({click:()=> State.to('Start')})
	}
	draw() {
		this.#drawGridLines()
	}
}, powChk = ctrl('powChk')