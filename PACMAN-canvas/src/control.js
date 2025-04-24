import './panel.js'
import {Confirm}  from '../_lib/confirm.js'
import {Menu}     from './_main.js'
import {State}    from './state.js'
import {drawText} from './message.js'

/** @returns {HTMLInputElement} */
const input = id=> Form[id]
const Form  = document.forms[0]

export const Ctrl = new class {
	static {$ready(this.setup)}
	static setup() {
		Ctrl.#restore()
		Ctrl.#setupFormCtrls()
		Ctrl.drawInfo()
		$on({resize:Ctrl.#fitToViewport}).trigger('resize')
	}
	get extendPts()     {return +Menu.ExtendMenu.value}
	get livesMax()      {return input('lvsRng').valueAsNumber}
	get speedRate()     {return input('spdRng').valueAsNumber}
	get isChaseMode()   {return input('chsChk').checked}
	get consecutive()   {return input('onlChk').checked == false}
	get unrestricted()  {return input('unrChk').checked}
	get invincible()    {return input('invChk').checked}
	get showTargets()   {return input('tgtChk').checked}
	get showGridLines() {return input('grdChk').checked}
	get isPractice()    {return Ctrl.isCheatMode  ||!Ctrl.isDefaultMode}
	get isCheatMode()   {return Ctrl.speedRate<.7 || Ctrl.showTargets || Ctrl.invincible}
	get isDefaultMode() {return Ctrl.consecutive && Menu.LevelMenu.index == 0}

	#fitToViewport() {
		const scale = min(
			innerWidth /Form.offsetWidth * .98,
			innerHeight/Form.offsetHeight)
		Form.style.scale = min(1, round(scale*100)/100)
	}
	#update() {
		Ctrl.drawInfo()
		Ctrl.#saveData()
		return this
	}
	#saveData() {
		const data = {}
		for (const c of dqsAll('custom-menu,input')) {
			if (!c.id) continue
			data[c.id]= {
				menu:    Menu[c.id]?.index,
				range:   c.valueAsNumber,
				checkbox:c.checked,
			}[c.type]
		}
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
		const data = JSON.parse(localStorage.anopacman || null) || {}
		for (const [id,val] of entries(data)) {
			if (!byId(id)) continue
			switch(id.match(/[A-Z][a-z\d]+$/)[0]) {
			case 'Rng':input(id).value  =val;break
			case 'Chk':input(id).checked=val;break
			case 'Menu':Menu[id].select(val);break
			}
			$byId(id).trigger('input')
		}
	}
	#drawGrid() {
		if (!Ctrl.showGridLines) return
		Inf.ctx.strokeStyle = Color.Grid
		for (let y=1; y<Cols; y++) Inf.ctx.strokeLine(T*y, 0, T*y, Rows*T)
		for (let x=0; x<Rows; x++) Inf.ctx.strokeLine(0, T*x, Cols*T, T*x)
	}
	drawInfo() {
		const {ctx} = Inf, lh = 0.84
		const draw  = (...args)=> drawText(...args, cfg)
		const cfg   = {ctx, size:T*0.68, style:'bold', scale:[.7,1]}
		const speed = Ctrl.speedRate.toFixed(1)
		ctx.save()
		ctx.clear()
		Ctrl.#drawGrid()
		ctx.translate(0, T*18)
		if (Ctrl.isCheatMode || speed != '1.0') {
			draw(.1, lh*0, Color.InfoTable[+(speed != '1.0')],`Speed x${speed}`)
			draw(.1, lh*1, Color.InfoTable[+Ctrl.invincible], 'Invincible')
			draw(.1, lh*2, Color.InfoTable[+Ctrl.showTargets],'Targets')
		}
		if (Ctrl.unrestricted) {
			ctx.translate(T*(Cols-4.9), T/2)
			draw(0,0, Color.InfoTable[1], 'Un-\nrestricted')
		}
		ctx.restore()
	}
	#setupFormCtrls() {
		for (const menu of values(Menu)) {
			menu.bindChange(Ctrl.#update)
		}
		$('#clearStorageBtn').on({click:()=>
			Confirm.open('Are you sure you want to clear local storage?',
				null,Ctrl.#removeData, 'No','Yes', 0)
		})
		$('input')    .on({input:Ctrl.#update})
		$('#defBtn')  .on({click:Ctrl.#setDefault})
		$('#startBtn').on({click:()=> State.to('Start')})
	}
}, powChk = input('powChk')