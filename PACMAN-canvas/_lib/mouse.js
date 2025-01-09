import {Vec2} from './vec2.js';
export const Cursor = new class {
	hide()    {this.#setState('hidden')}
	default() {this.#setState('default')}
	#setState(state) {dRoot.dataset.cursor = state}
	static {
		let timerId=0, lstPos={x:0, y:0}
		$on('mousemove', e=> {
			clearTimeout(timerId)
			timerId = setTimeout(()=> Cursor.#setState('stayStill'), 2e3)
			const {pageX:x, pageY:y}= e
			Vec2.distance(lstPos,{x,y}) > 2 && Cursor.default()
			lstPos = {x,y}
		})
	}
}
const dBody = document.body
!(new class { // Enable mouse wheel on range controls
	vals = i=> [[i.value],[i.min,0],[i.max,100],[i.step,1]].map(a=> toNumber(...a))
	setup(tgt) {
		tgt == dBody && $('form').on('reset', e=> this.setup(e.target))
		$(tgt).find('input[type=range]').each((_,i)=> this.setupCtrl(i,tgt))
	}
	setupCtrl(ctrl,root) { // Labels must be block-level
		const output = dqs(`output[for~="${ctrl.id}"]`) ?? []
		if (root != dBody) return $(output).text(+ctrl.defaultValue)
		const ids   = ctrl.dataset.links?.trim().split(/\s+/) ?? []
		const label = ctrl.closest('label') || dqs(`label[for="${ctrl.id}"]`)
		const links = new Set(ids.flatMap(id=> dqs(`input#${id}`) ?? []))
		const onInput = ()=> {
			const [value,min,max]= this.vals(ctrl)
			$([ctrl,output, ...links])
				.prop({value}).css({'--ratio':`${norm(min,max,value)*100}%`})
		}
		const onWheel = e=> {
			if (ctrl.disabled) return
			e = e.originalEvent
			e.preventDefault()
			const [val,min,max,step]= this.vals(ctrl)
			const sigD = String(step).split('.')[1]?.length ?? 0
			const cVal = Number(val + (0 < e.deltaY ? -step : step)).toFixed(sigD)
			ctrl.value = clamp(cVal, min, max)
			between(cVal,min,max) && $(ctrl).trigger('input')
		}
		$(output).text(ctrl.value)
		$(label || ctrl).on('wheel',onWheel)
		$(ctrl).on('input',onInput).trigger('input')
	}
}).setup(dBody)