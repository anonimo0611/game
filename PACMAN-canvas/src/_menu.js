import * as Menu from '../_lib/menu.js'
export const LevelMenu = new class extends Menu.DorpDownMenu {
	constructor() {
		super('LevelMenu')
		for (const li of this.lis)
			$(li).css('--o', li.dataset.val)
	}
	select(idx=this.index) {
		super.select(idx)
		$(this.current).css('--o', this.value)
	}
}
,ExtendScoreMenu = new Menu.SlideMenu('ExtendScoreMenu')