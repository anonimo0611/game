import {Confirm}  from '../_lib/confirm.js'
import {Menu}     from './ui.js'
import {MenuIds}  from './ui.js'
import {State}    from './state.js'
import {drawText} from './message.js'

const Form = document.forms[0]

/** @param {string} id */
export const ctrl = id=>/**@type {HTMLInputElement}*/(byId(id))

export const Ctrl = new class {
	static {$ready(this.setup)}
	static setup() {
		Ctrl.#restore()
		Ctrl.#setupCtrls()
		Ctrl.#drawInfo()
		$on({resize:Ctrl.#fitToViewport}).trigger('resize')
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
	get isPractice()    {return Ctrl.isCheatMode  ||!Ctrl.isDefaultMode}
	get isCheatMode()   {return Ctrl.speedRate<.7 || Ctrl.showTargets || Ctrl.invincible}
	get isDefaultMode() {return Ctrl.consecutive && Menu.Level.index == 0}

	#fitToViewport() {
		const scale = min(
			innerWidth /Form.offsetWidth * .98,
			innerHeight/Form.offsetHeight)
		Form.style.scale = min(1, round(scale*100)/100).toString()
	}
	#update() {
		Ctrl.#drawInfo()
		Ctrl.#saveData()
		return this
	}
	#saveData() {
		const data = Object.create(null)
		document.querySelectorAll('input').forEach(e=> {
			if (!e.id) return
			data[e.id]= {range:+e.value, checkbox:e.checked}[e.type]
		})
		MenuIds.forEach(id=> data[id] = Menu[id].index)
		localStorage.anopacman = JSON.stringify(data)
	}
	#removeData() {
		localStorage.removeItem('anopacman')
		localStorage.removeItem('anopac_hiscore')
		Ctrl.#setDefault()
		State.to('Title')
	}
	#setDefault() {
		Form.reset()
		Ctrl.#update().#restore()
	}
	#restore() {
		const data = JSON.parse(localStorage.anopacman||null)||{}
		for (const [id,val] of entries(data)) {
			switch(ctrl(id)?.type) {
			case 'range':   ctrl(id).value  =val;break
			case 'checkbox':ctrl(id).checked=val;break
			}
		}
		MenuIds.forEach(id=> Menu[id].index = data[id])
	}
	drawGrid() {
		if (!Ctrl.showGridLines) return
		Ctx.save()
		Ctx.strokeStyle = Color.Grid
		for (let y=1; y<Cols; y++) Ctx.strokeLine(T*y, 0, T*y, Rows*T)
		for (let x=0; x<Rows; x++) Ctx.strokeLine(0, T*x, Cols*T, T*x)
		Ctx.restore()
	}
	#drawInfo() {
		const{ctx}= HUD, lh = 0.84, ColTbl = Color.InfoTable
		const spd = 'x'+Ctrl.speedRate.toFixed(1)
		const cfg = {ctx, size:T*0.68, style:'bold', scaleX:.7}
		ctx.save()
		ctx.translate(T*0.1, T*18)
		ctx.clearRect(0, -T, CvsW, T*3)
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
	#setupCtrls() {
		for (const menu of values(Menu)) {
			menu.on({change:Ctrl.#update})
		}
		$('#clearStorageBtn').on({click:()=>
			Confirm.open('Are you sure you want to clear local storage?',
				null,Ctrl.#removeData, 'No','Yes', 0)
		})
		$('input')    .on({input:Ctrl.#update})
		$('#defBtn')  .on({click:Ctrl.#setDefault})
		$('#startBtn').on({click:()=> State.to('Start')})
	}
}, powChk = ctrl('powChk')