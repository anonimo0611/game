import {cvs}   from './_canvas.js';
import {Score} from './score.js';

export const Field = freeze(new class {
	Frame  = 16;
	Top    = Score.Height + this.Frame;
	Left   = this.Frame;
	Bottom = cvs.height;
	Right  = cvs.width  - this.Frame;
	Width  = cvs.width  - this.Frame*2;
	Height = cvs.height - this.Top;
	collision() {}
});