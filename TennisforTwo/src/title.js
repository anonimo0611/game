import {Scene}   from './scene.js';
import {Pointer} from './pointer.js';
import {Court}   from './court.js';
import {cvs,ctx} from './canvas.js';

export const Title = freeze(new class {
	FontSize = int(cvs.height/7.2);
	#drawTextForTouchDevice(fs, lw) {
		ctx.clearRect(-lw, -fs, lw*2, fs);
		ctx.strokeText(`TAP${SP}TO${SP}START`, 0, -fs/8);
	}
	#drawTextForMouseDevice(fs, lw) {
		ctx.clearRect(-lw, -fs-fs/2, lw*2, fs);
		ctx.strokeText(`CLICK${SP}TO${SP}START`, 0, -fs/2-fs/8);
		this.#drawkeyCtrls(fs, lw);
	}
	#drawkeyCtrls(fs, lw) {
		ctx.font = `${fs/2}px VectorBold`;
		ctx.lineWidth = lw/3;

		ctx.save();
		ctx.translate(-cvs.width/4, -fs/4);
		ctx.strokeText(`PRESS 'R' TO${SP}RESET`,   0, fs/2-fs/8);
		ctx.strokeText(`PRESS 'ESC' TO${SP}PAUSE`, 0, fs*1-fs/8);
		ctx.restore();

		ctx.save();
		ctx.translate(+cvs.width/4, -fs/2);
		ctx.strokeText(`PRESS 'M' TO${SP}MUTE`, 0, fs-fs/8);
		ctx.restore();
	}
	draw() {
		if (!Scene.isTitle) return;
		const fs = this.FontSize;
		const lw = Court.LineWidth;
		ctx.save();
		ctx.translate(cvs.width/2, (cvs.height-fs)/2 + fs/2.5);
		ctx.font = `${fs}px VectorBold`;
		ctx.textAlign ='center';
		ctx.lineWidth = lw/2;
		Pointer.isTouchDevice
			? this.#drawTextForTouchDevice(fs, lw)
			: this.#drawTextForMouseDevice(fs, lw);
		ctx.restore();
	}
});const SP = '\u2002';