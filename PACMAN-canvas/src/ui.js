import * as _Menu  from '../_lib/menu.js'
import {panelBtns} from './inputs.js';

//---- Menus ----

export const Menu = freeze({
	Level: new _Menu.DorpDown('LevelMenu'),
	Extend:new _Menu.Slide('ExtendMenu'),
})

//---- Panels ----

panelBtns.forEach(btn=> {
	$(btn).on('keydown pointerdown', e=> {
		if (e.key && !isEnterKey(e))
			return
		$('.panel').toggle()
		$(btn).toggleClass('opened')
	})
	$('body').on('keydown pointerdown', e=> {
		if (!btn.offsetParent
		 || e.target == btn
		 || qS(btn.value)?.contains(e.target))
			return
		$(btn.value).hide()
		$(btn).removeClass('opened')
	})
})