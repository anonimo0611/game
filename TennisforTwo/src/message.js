import {cvs,ctx} from './canvas.js';
import {Title}   from './title.js';
import {Color}   from './colors.js';
import {Court}   from './court.js';
export const Message = {
	draw(text, color=Court.CyanRGBA) {
		const fs = Title.FontSize;
		const lw = Court.LineWidth;
		ctx.save();
		ctx.translate(cvs.width/2, (cvs.height-fs)/2 + fs/4);
		ctx.font = `${fs}px VectorBold`;
		ctx.textAlign   = 'center';
		ctx.lineWidth   = lw/2;
		ctx.strokeStyle = color;
		ctx.clearRect(-lw, -fs+fs/8, lw*2, fs);
		ctx.strokeText(text, 0, 0);
		ctx.restore();
	}
};