import {State} from '../lib/state.js';
import {Grid}  from './_grid.js';
import {Orb,Orbs,OrbType} from './orb.js';

const FadeSpeed = 1/30;
const FallSpeed = Grid.Size/16;

export const Phase = freeze(new class extends State {
	isIdle   = true;
	isSwap   = false;
	isRemove = false;
	isFall   = false;
	constructor() {
		super();
		this.init();
	}
	switch(phase) {
		super.switch(phase);
	}
	update() {
		switch (Phase.current) {
		case Phase.enum.Remove:
			Phase.#remove();
			break;
		case Phase.enum.Fall:
			Phase.#fall();
			break;
		}
	}
	#remove() {
		let removing = false;
		Orbs.flat().forEach(orb=> {
			if (orb.fadeOut <= 0) return;
			removing = true;
			orb.fadeOut -= FadeSpeed;
			if (orb.fadeOut <= 0) {
				orb.fadeOut =  0;
				orb.type = OrbType.None;
			}
		});
		if (removing || Orb.remove()) return;
		Orb.fall();
		Phase.switch(Phase.enum.Fall);
	}
	#fall() {
		let falling = false;
		Orbs.flat().forEach(orb=> {
			if (orb.fallY >= 0) return;
			falling = true;
			orb.fallY += FallSpeed;
			if (orb.fallY >= 0)
				orb.fallY = 0;
		});
		if (!falling && !Orb.fall()) {
			if (Orb.remove())
				return void Phase.switch(Phase.enum.Remove);
			Orbs.flat().forEach(orb=> orb.combo = 0);
			Phase.switch(Phase.enum.Idle);
		}
	}
});