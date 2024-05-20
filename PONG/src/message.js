import {Ticker}  from '../lib/timer.js';
import {cvs,ctx} from './_canvas.js';
import {Scene}   from './scene.js';
import {Pointer} from './ctrl.js';

export const Message = new class {
	#drawText(text, {
		fontSize=60,
		align='center',
		x=cvs.width/2,
		y=cvs.height * 3/4 - fontSize/2
	}={})
	{
		ctx.save();
		ctx.translate(x, y);
		if (align == 'center')
		{   // Background
			ctx.globalCompositeOperation = 'destination-out';
			ctx.lineWidth = 10;
			ctx.beginPath();
			ctx.moveTo(0, -fontSize*1.1);
			ctx.lineTo(0, +fontSize/3);
			ctx.stroke();
			ctx.globalCompositeOperation = 'source-over';
		}
		{   // Message text
			ctx.textAlign = align;
			ctx.font = `${fontSize}px Vector`;
			ctx.fillText(text,  0,0);
		}
		ctx.restore();
	}
	draw() {
		if (Ticker.paused)
			this.#drawText('PAUSED!');
		if (Scene.isDemo) {
			const actionType = Pointer.isTouchDevice ? 'TAP' : 'CLICK';
			this.#drawText(actionType+' TO START!');
			if (Pointer.isTouchDevice) return;
			this.#drawText("'ESC' TO PAUSE", {
				fontSize: 40,
				align: 'left',
				x: 20, 
				y: cvs.height - 20
			});
			this.#drawText("'R' TO RESET", {
				fontSize: 40,
				align: 'right',
				x: cvs.width  - 20, 
				y: cvs.height - 20
			});
		}
	}
}
