import {cvs} from './_canvas.js';
export const Field = freeze(new class {
	Frame     = 24;
	Cols      = 13;
	Rows      = 32;
	Width     = cvs.width - this.Frame*2;
	Diagonal  = sqrt(cvs.height**2 + cvs.width**2);
	ColWidth  = int(this.Width/this.Cols);
	RowHeight = int(cvs.height/this.Rows);
	Top       = this.RowHeight*2;
	Left      = this.Frame;
	Bottom    = cvs.height;
	Right     = cvs.width - this.Frame;
	Segments  = deepFreeze([
		[vec2(this.Left,  this.Top), vec2(this.Right, this.Top)],
		[vec2(this.Left,  this.Top), vec2(this.Left,  this.Bottom)],
		[vec2(this.Right, this.Top), vec2(this.Right, this.Bottom)],
	]);
	collision() {}
	rebound({Pos,Velocity,Radius:r}) {
		const {Top,Left,Right}= this;
    	if (Pos.x-r < Left) {
			Pos.x = Left+r;
        	Velocity.x = abs(Velocity.x);
        }
    	if (Pos.x+r > Right) {
			Pos.x = Right-r;
        	Velocity.x = -abs(Velocity.x);
       }
    	if (Pos.y-r < Top) {
			Pos.y = Top+r;
        	Velocity.y *= -1;
    	}
	}
});