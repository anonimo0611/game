import {cvs} from './_canvas.js';
export const Grid = freeze(new class {
	Rows   = 5;
	Cols   = 6;
	Size   = cvs.width / this.Cols;
	Length = this.Rows * this.Cols;
});