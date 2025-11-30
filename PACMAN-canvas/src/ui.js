//---- Menus ----

import * as _Menu from '../_lib/menu.js'
export const Menu = freeze({
	Level: new _Menu.DorpDown('LevelMenu'),
	Extend:new _Menu.Slide('ExtendMenu'),
}),
MenuIds = /**@type {(keyof Menu)[]}*/(keys(Menu));

//---- Panels ----

/** @type {NodeListOf<HTMLButtonElement>} */
(qSAll('.panelBtn')).forEach(btn=> {
	$(btn).on('keydown pointerdown', e=> {
		if (nonEnterKey(e))
			return
		$('.panel').toggle()
		$(btn).toggleClass('opened')
	})
	$(dBody).on('keydown pointerdown', e=> {
		if (!btn.offsetParent
		|| e.target == btn
		|| e.target.closest(btn.value))
			return
		$(btn.value).hide()
		$(btn).removeClass('opened')
	})
})