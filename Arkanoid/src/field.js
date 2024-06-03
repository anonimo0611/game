import {cvs} from './_canvas.js';
export const Field = freeze(new class {
	Frame     = 24;
	Cols      = 13;
	Rows      = 30;
	Width     = cvs.width - this.Frame*2;
	ColWidth  = int(this.Width/this.Cols);
	RowHeight = int(cvs.height/this.Rows);
	Top       = this.RowHeight + this.Frame;
	Left      = this.Frame;
	Bottom    = cvs.height;
	Right     = cvs.width  - this.Frame;
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