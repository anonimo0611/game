import {Confirm}   from '../_lib/confirm.js'
import {Cvs,Ctx}   from './_canvas.js'
import * as Menu   from './_menu.js'
import {LevelMenu} from './_menu.js'
import {State}     from './_state.js'
import {drawText}  from './message.js'
import {Color,ColMax,RowMax,LineW,TileSize as T} from './_constants.js'

export const Ctrl = new class {
	static {$ready(this.setup)}
	static setup() {
		Ctrl.#restore()
		Ctrl.#setupFormCtrls()
		Ctrl.#hideAllPanel()
		$on('Start', Ctrl.#hideAllPanel)
		$on('resize',Ctrl.#fitToViewport).trigger('resize')
	}
	get livesMax()      {return +Form.lvsRng.value}
	get speedRate()     {return +Form.spdRng.value}
	get extendPts()     {return +Menu.ExtendScoreMenu.value}
	get isChaseMode()   {return Form.chsChk.checked == true}
	get consecutive()   {return Form.onlChk.checked == false}
	get unrestricted()  {return Form.unrChk.checked == true}
	get invincible()    {return Form.invChk.checked == true}
	get showTargets()   {return Form.tgtChk.checked == true}
	get showGridLines() {return Form.grdChk.checked == true}
	get isPractice()    {return Ctrl.isCheatMode  ||!Ctrl.isDefaultMode}
	get isCheatMode()   {return Ctrl.speedRate<.7 || Ctrl.showTargets || Ctrl.invincible}
	get isDefaultMode() {return Ctrl.consecutive && LevelMenu.index == 0}

	#fitToViewport() {
		const scale = min(
			innerWidth /Form.offsetWidth * .98,
			innerHeight/Form.offsetHeight)
		Form.style.transform = `scale(${min(1,scale)})`
	}
	#saveData() {
		const data = {}
		for (const ctrl of dqsAll('.menu,input')) {
			if (!ctrl.id) continue
			data[ctrl.id] = {
				menu:    Menu[ctrl.id]?.index,
				range:   ctrl.valueAsNumber,
				checkbox:ctrl.checked,
			}[ctrl.type]
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
			if (id.endsWith('Rng'))  byId(id).value   = val
			if (id.endsWith('Chk'))  byId(id).checked = val
			if (id.endsWith('Menu')) Menu[id].select(val)
			$byId(id).trigger('input')
		}
	}
	drawGridLines() {
		if (!Ctrl.showGridLines) return
		Ctx.save()
		Ctx.strokeStyle = Color.Grid
		for (let y=1; y<ColMax; y++) cvsStrokeLine(Ctx)(T*y, 0, T*y, RowMax*T)
		for (let x=0; x<RowMax; x++) cvsStrokeLine(Ctx)(-LineW, T*x, Cvs.width, T*x)
		Ctx.restore()
	}
	drawInfo() {
		const draw  = (...args)=> drawText(...args, cfg)
		const cfg   = {size:T*0.68, style:'bold'}, lh = 0.84
		const speed = Ctrl.speedRate.toFixed(1)
		Ctx.save()
		if (Ctrl.isCheatMode || speed != '1.0') {
			Ctx.setTransform(0.7, 0,0, 1, T*0.1, T*18)
			draw(0, lh*0, Color.InfoList[+(speed != '1.0')],`Speed x${speed}`)
			draw(0, lh*1, Color.InfoList[+Ctrl.invincible], 'Invincible')
			draw(0, lh*2, Color.InfoList[+Ctrl.showTargets],'Targets')
		}
		if (Ctrl.unrestricted) {
			Ctx.setTransform(0.7, 0,0, 1, T*23.3, T*18.35)
			draw(0,0, Color.InfoList[1], 'Un-\nrestricted')
		}
		Ctx.restore()
	}
	#hideAllPanel() {
		$('.panel').hide()
	}
	#hidePanel(btn, e) {
		const idS = `#${btn.dataset.for}Panel`
		btn != e.target && !e.target.closest(idS) && $(idS).hide()
	}
	#setupFormCtrls() {
		$('#clearStorageBtn').on('click', ()=> {
			Confirm.open('Are you sure you want to clear local storage?',
				null,Ctrl.#removeData, 'No','Yes', 0)
		})
		dqsAll('.panelBtn').forEach(btn=> {
			$(btn).on('click', ()=> $('.panel').toggle())
			$on('click', e=> State.isTitle && Ctrl.#hidePanel(btn, e))
		})
		$('input')  .on('input', Ctrl.#saveData)
		$('#defBtn').on('click', Ctrl.#setDefault)
		values(Menu).forEach(m=> m.bindEvent(Ctrl.#saveData))
	}
}, Form = document.forms[0]