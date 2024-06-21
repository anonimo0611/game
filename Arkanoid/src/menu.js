import {Stages}    from './stage.js';
import {SlideMenu} from '../lib/menu.js';

const SelectStage = byId('SelectStage');
const SelectLives = byId('SelectLives');

export const StageMenu = new class extends SlideMenu {
	static {
		for (let i=0; i<Stages.length; i++) { // Initialize
			const num = String(i+1).padStart(2, 0);
			const $LI = $(`<li data-val="${i}">${num}</li>`);
			if (i == 0) $LI.addClass('selected');
			$(SelectStage).find('menu').append($LI);
		}
	}
	constructor() {
		super(SelectStage.id);
	}
	select(idx) {
		super.select(idx);
		$(this).trigger('change', idx);
	}
};
export const LivesMenu = new class extends SlideMenu {
	constructor() {
		super(SelectLives.id);
	}
	select(idx) {
		super.select(idx);
		$(this).trigger('change', this.value);
	}
};