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
			const {value,min,max}= ctrl
			$([ctrl,output, ...links])
				.prop({value}).css({'--ratio':`${norm(min,max,value)*100}%`})
		}
		const onWheel = e=> {
			e.preventDefault()
			0 < e.originalEvent.deltaY
				? ctrl.stepDown()
				: ctrl.stepUp()
			$(ctrl).trigger('input')
		}
		$(output).text(ctrl.value)
		$(label || ctrl).on('wheel',onWheel)
		$(ctrl).on('input',onInput).trigger('input')
	}
}).setup(dBody)