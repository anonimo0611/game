import './panel.js'
import {Confirm}   from '../_lib/confirm.js'
import * as Menu   from './_menu.js'
import {LevelMenu} from './_menu.js'
import {State}     from './_state.js'
import {drawText}  from './message.js'

/** @returns {HTMLInputElement} */
const ctrl = id=> Form[id]
const Form = document.forms[0]

export const Ctrl = new class {
	static {$ready(this.setup)}
	static setup() {
		Ctrl.#restore()
		Ctrl.#setupFormCtrls()
		$on('resize',Ctrl.#fitToViewport).trigger('resize')
	}
	get extendPts()     {return +Menu.ExtendScoreMenu.value}
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
	get isDefaultMode() {return Ctrl.consecutive && LevelMenu.index == 0}

	#fitToViewport() {
		const scale = min(
			innerWidth /Form.offsetWidth * .98,
			innerHeight/Form.offsetHeight)
		Form.style.scale = min(1,round(scale*100)/100)
	}
	#saveData() {
		const data = {}
		for (const c of dqsAll('.menu,input')) {
			if (!c.id) continue
			data[c.id]= {
				menu:    Menu[c.id]?.index,
				range:   c.valueAsNumber,
				checkbox:c.checked,
			}[c.type]
		}
		localStorage.anopacman = JSON.stringify(data)
		return this
	}
	#removeData() {
		localStorage.removeItem('anopacman')
		localStorage.removeItem('anopac_hiscore')
		Ctrl.#setDefault()
		$trigger('InitData')
	}
	#setDefault() {
		Form.reset()
		Ctrl.#saveData().#restore()
	}
	#restore() {
		const data = JSON.parse(localStorage.anopacman || null) || {}
		for (const [id,val] of entries(data)) {
			if (!byId(id)) continue
			switch(id.match(/[A-Z][a-z\d]+$/)[0]) {
			case 'Rng': ctrl(id).value  =val;break
			case 'Chk': ctrl(id).checked=val;break
			case 'Menu':Menu[id].select(val);break
			}
			$byId(id).trigger('input')
		}
	}
	drawGridLines() {
		if (!Ctrl.showGridLines) return
		Ctx.save()
		Ctx.strokeStyle = Color.Grid
		for (let y=1; y<Cols; y++) Ctx.strokeLine(T*y, 0, T*y, Rows*T)
		for (let x=0; x<Rows; x++) Ctx.strokeLine(0, T*x, Cols*T, T*x)
		Ctx.restore()
	}
	drawInfo() {
		const draw  = (...args)=> drawText(...args, cfg)
		const cfg   = {size:T*0.68, style:'bold'}, h = 0.84
		const speed = Ctrl.speedRate.toFixed(1)
		Ctx.save()
		if (Ctrl.isCheatMode || speed != '1.0') {
			Ctx.setTransform(0.7, 0,0, 1, T*0.1, T*18)
			draw(0, h*0, Color.InfoTable[+(speed != '1.0')],`Speed x${speed}`)
			draw(0, h*1, Color.InfoTable[+Ctrl.invincible], 'Invincible')
			draw(0, h*2, Color.InfoTable[+Ctrl.showTargets],'Targets')
		}
		if (Ctrl.unrestricted) {
			Ctx.setTransform(0.7, 0,0, 1, T*23.1, T*18.35)
			draw(0,0, Color.InfoTable[1], 'Un-\nrestricted')
		}
		Ctx.restore()
	}
	#setupFormCtrls() {
		for (const menu of values(Menu)) {
			menu.bindChange(Ctrl.#saveData)
		}
		$('#clearStorageBtn').on('click', ()=> {
			Confirm.open('Are you sure you want to clear local storage?',
				null,Ctrl.#removeData, 'No','Yes', 0)
		})
		$('input')    .on('input', Ctrl.#saveData)
		$('#defBtn')  .on('click', Ctrl.#setDefault)
		$('#startBtn').on('click', State.switchToStart)
	}
}, powChk = ctrl('powChk')