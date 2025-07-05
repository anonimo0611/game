import {Confirm}  from '../_lib/confirm.js'
import {Score}    from './score.js'
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
		Ctrl.#drawInfo()
		Ctrl.#fitToViewport()
		$load(Ctrl.#setup)
	}
	get extendPts()     {return +Menu.Extend.value}
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
		document.querySelectorAll('input').forEach(e=> {
			match(e.type, {
			range:   ()=> {data[e.id] = e.value},
			checkbox:()=> {data[e.id] = e.checked},
			})
		})
		localStorage.anopacman = JSON.stringify(data)
	}
	#restore() {
		if (!localStorage.anopacman) return
		const data = JSON.parse(localStorage.anopacman)
		MenuIds.forEach(id=> Menu[id].index = data[id])
		document.querySelectorAll('input').forEach(e=> {
			match(e.type, {
			range:   ()=> {e.value   = data[e.id]},
			checkbox:()=> {e.checked = data[e.id]},
			})
		})
	}
	#clearHiScore() {
		localStorage.removeItem('anopac_hiscore')
		Score.reset()
	}
	#reset() {
		Form.reset()
		Ctrl.#update().#restore()
	}
	#update() {
		Ctrl.#save()
		Ctrl.#drawInfo()
		return this
	}
	draw() {
		if (!Ctrl.showGridLines) return
		Ctx.save()
		Ctx.strokeStyle = Color.Grid
		for (const y of range(1,Cols)) Ctx.strokeLine(T*y, 0, T*y, Rows*T)
		for (const x of range(0,Rows)) Ctx.strokeLine(0, T*x, Cols*T, T*x)
		Ctx.restore()
	}
	#drawInfo() {
		const{ctx}= HUD, lh = 0.84, ColTbl = Color.InfoTable
		const spd = 'x'+Ctrl.speedRate.toFixed(1)
		const cfg = {ctx, size:T*0.68, style:'bold', scaleX:.7}
		ctx.save()
		ctx.translate(T*0.1, T*18)
		ctx.clearRect(0, -T, CW, T*3)
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
			menu.on('change', Ctrl.#update)
		}
		$win.on('resize', Ctrl.#fitToViewport)
		$('#clearHiScore').on({click:()=>
			Confirm.open('Are you sure you want to clear high-score?',
				null,Ctrl.#clearHiScore, 'No','Yes', 0)
		})
		$('input')    .on('input', Ctrl.#update)
		$('#resetBtn').on('click', Ctrl.#reset)
		$('#startBtn').on('click', ()=> State.to('Start'))
	}
}, powChk = ctrl('powChk')