import {cvs} from './_canvas.js';
export const Field = freeze(new class {
	Frame = 24;
	Cols  = 13;
	Rows  = 32;

	ColWidth  = int((cvs.width - this.Frame*2) / this.Cols);
	RowHeight = int(cvs.height / this.Rows);
	Width     = this.ColWidth * this.Cols;
	Height    = cvs.height - (this.RowHeight + this.Frame*1.5);

	Top      = cvs.height - this.Height;
	Right    = cvs.width  - this.Frame;
	Bottom   = cvs.height;
	Left     = this.Frame;
	Diagonal = sqrt(this.Width**2 + this.Height**2);

	Segments = deepFreeze([
		[vec2(this.Left, this.Top), vec2(this.Right,this.Top)],    // top
		[vec2(this.Left, this.Top), vec2(this.Left, this.Bottom)], // left
		[vec2(this.Right,this.Top), vec2(this.Right,this.Bottom)], // right
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