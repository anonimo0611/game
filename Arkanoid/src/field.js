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
	rebound({Pos,Velocity,Radius:r}) {
		const {Top,Left,Right}= this;
    	if (Pos.x-r < Left) {
			Pos.x = Left+r;
        	Velocity.x *= -1;
        }
    	if (Pos.x+r > Right) {
			Pos.x = Right-r;
        	Velocity.x *= -1;
        }
    	if (Pos.y-r < Top) {
			Pos.y = Top+r;
        	Velocity.y *= -1;
    	}
	}
});