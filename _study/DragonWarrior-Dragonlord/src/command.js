import {Phase}   from './phase.js';
import {Message} from './windowSystem.js';
export const Command = new class {
	#idx  = 0;
	Enum  = freeze({Attack:0, Spell:1, Max:2});
	Items = freeze(['たたかう','ベホイミ']);
	get Max()     {return this.Enum.Max}
	get current() {return this.#idx}
	constructor() {$on('keydown', this.#onKeyDown.bind(this))}
	#onKeyDown(e) {
		if (Phase.isClear && e.key == 'Enter')
			Phase.switchToStart();

		if (!Phase.isSelect) return;
		switch (e.key) {
		case 'ArrowUp':   return this.#up();
		case 'ArrowDown': return this.#down();
		case 'Enter':
			Phase.switchToBattle();
			Message.set();
			this.#idx = 0;
			break;
		}
	}
	#loop () {this.#idx = (this.#idx+Command.Max) % Command.Max}
	#up()    {this.#loop(this.#idx++)}
	#down()  {this.#loop(this.#idx--)}
};
deepFreeze(Command);