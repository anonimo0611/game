import {cvs} from './_canvas.js';
export const Field = freeze(new class {
	Frame = 24;
	Cols  = 13;
	Rows  = 32;

	ColWidth  = round((cvs.width - this.Frame*2) / this.Cols);
	RowHeight = round(cvs.height / this.Rows);
	Width     = this.ColWidth * this.Cols;
	Height    = cvs.height - (this.RowHeight + this.Frame*1.5);

	Top      = cvs.height - this.Height;
	Right    = cvs.width  - this.Frame;
	Bottom   = cvs.height;
	Left     = this.Frame;
	Diagonal = sqrt(cvs.width**2 + cvs.height**2);

	collision() {}
});