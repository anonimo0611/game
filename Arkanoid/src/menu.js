import {Stages} from './stage.js';
import * as MenuBase from '../lib/menu.js';

const SelectStage = byId('SelectStage');
const SelectLives = byId('SelectLives');

const StageMenu = new class extends MenuBase.SlideMenu {
	static {
		for (let i=0; i<Stages.length; i++) { // Initialize
			const num = String(i+1).padStart(2, 0);
			const cLI = makeElm(`li[data-val=${i}]`).text(num);
			if (i == 0) cLI.addClass('selected');
			SelectStage.qs('menu').append(cLI);
		}
	}
	constructor() {
		super(SelectStage.id);
	}
	select(idx, {restore=false}={}) {
		super.select(idx);
		$trigger('SelStage', idx);
	}
};
const LivesMenu = new class extends MenuBase.SlideMenu {
	constructor() {
		const idx = +localStorage.arkanoidLives;
		super(SelectLives.id, idx);
	}
	select(idx, {restore=false}={}) {
		super.select(idx);
		$trigger('SelLives', this.value);
		!restore && (localStorage.arkanoidLives=idx);
	}
};
export const Menu = freeze({StageMenu,LivesMenu});