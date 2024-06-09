import {cvs} from './_canvas.js';
export const Field = freeze(new class {
	Frame     = 24;
	Cols      = 13;
	Rows      = 32;

	RowHeight = int(cvs.height/this.Rows);
	Height    = cvs.height - (this.RowHeight + this.Frame*1.5);

	Width     = cvs.width - this.Frame*2;
	ColWidth  = int(this.Width/this.Cols);
	Diagonal  = sqrt(this.Width**2 + this.Height**2);

	Top       = cvs.height - this.Height;
	Bottom    = cvs.height;
	Left      = this.Frame;
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