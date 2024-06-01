import * as MenuBase from '../lib/menu.js';
import {Stages} from './stage.js';

const SelectStage = byId('SelectStage');
const SelectLives = byId('SelectLives');
const LivesLeft   = Number(localStorage.arkanoidLives);

export const Menu = freeze({
	Stage: new class extends MenuBase.SlideMenu {
		static {
			for (let i=0; i<Stages.length; i++) { // Initialize
				const num = String(i+1).padStart(2, 0);
				const cLI = makeElm(`li[data-val=${i}]`).text(num);
				if (i == 0) cLI.addClass('selected');
				SelectStage.qs('menu').append(cLI);
			}
		}
		constructor(id) {super(id)};
		select(idx, {restore=false}={}) {
			super.select(idx);
			$trigger('SelStage', idx);
		}
	}(SelectStage.id),
	Lives: new class extends MenuBase.SlideMenu {
		constructor(id, idx) {super(id, idx)};
		select(idx, {restore=false}={}) {
			super.select(idx);
			$trigger('SelLives', this.value);
			!restore && (localStorage.arkanoidLives=idx);
		}
	}(SelectLives.id, LivesLeft)
});