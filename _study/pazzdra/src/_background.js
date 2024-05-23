import {Grid} from './_grid.js';

const bgImg  = document.createElement('canvas');
const bgCtx  = bgImg.getContext('2d');
bgImg.width  = Grid.Size * Grid.Cols;
bgImg.height = Grid.Size * Grid.Rows;

integers(Grid.Length).forEach(i=> {
	const {Size,x,y}= {...Grid, ...Vec2.fromIdx(i, Grid.Cols)};
	bgCtx.fillStyle = ['#201008','#402010'][(x+y) % 2];
	bgCtx.fillRect(x*Size, y*Size, Size, Size);
});
export {bgImg};