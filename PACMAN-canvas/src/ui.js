//---- Menus ----

import * as _Menu from '../_lib/menu.js'
export const Menu = freeze({
	Level:  new _Menu.DorpDown('LevelMenu'),
	Extend: new _Menu.Slide('ExtendMenu'),
}),
MenuIds = /**@type {(keyof Menu)[]}*/(keys(Menu))

//---- Panels ----

;/**@type {HTMLButtonElement[]}*/
(qSAll('.panelBtn')).forEach(btn=> {
	btn.addEventListener('pointerdown', ()=> {
		$('.panel').toggle()
		btn.classList.toggle('opened')
	})
	addEventListener('pointerdown', e=> {
		const tgt = /**@type {Element}*/(e.target)
		if (!btn.offsetParent
		 || tgt == btn
		 || tgt.closest?.(btn.value))
			return
		$(btn.value).hide()
		btn.classList.remove('opened')
	})
});$ready(()=> $('.panel').hide())