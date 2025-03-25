import * as Menu from '../_lib/menu.js'
export const LevelMenu = new class extends Menu.DorpDownMenu {
	constructor() {
		super('LevelMenu')
		for (const li of this.lis)
			$(li).css('--icon-idx', li.dataset.val)
	}
	select(idx=this.index, {close=true}={}) {
		super.select(idx, {close})
		$(this.current).css('--icon-idx', this.value)
	}
}
,ExtendScoreMenu = new Menu.SlideMenu('ExtendScoreMenu')