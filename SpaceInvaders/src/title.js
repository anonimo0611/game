import {Ticker}    from '../lib/timer.js';
import {Timer}     from '../lib/timer.js';
import {rgba}      from '../lib/color.js';
import {cvs,ctx}   from './_canvas.js';
import {Window}    from './_window.js';
import {Scene}     from './scene.js';
import * as Sprite from './invader_sprite.js';

const SP       = '\u2002';
const FontSize = Window.FontSize;
const MarginV  = FontSize *.7;
const InvType  = Sprite.InvaderType;
const UfoSize  = Sprite.getSize(InvType.Ufo);

const HeaderLines = [
	{row:0.0, color:'#0F0', line:'PLAY'},
	{row:1.5, color:'#0F0', line:'SPACE　INVADERS'},
	{row:3.5, color:'#7ED', line:`*SCORE${SP}ADVANCE${SP}TABLE*`},
];
const InvadersLines = [
	{row:4.5, invType:InvType.Ufo,    line:`=?${SP}MYSTERY`},
	{row:5.5, invType:InvType.Squid,  line:`=30${SP}POINTS`},
	{row:6.5, invType:InvType.Crab,   line:`=20${SP}POINTS`},
	{row:7.5, invType:InvType.Octpus, line:`=10${SP}POINTS`},
];

const Lines = [...HeaderLines, ...InvadersLines];
const InvadersSectionWidth =
	max(...InvadersLines.map(l=> ctx.measureText(l.line).width));

function getY(row) {
	return (row*FontSize) + (row*MarginV);
}
function getTextWidth(ctx, {line,invType}) {
	return invType >= 0
		? InvadersSectionWidth
		: ctx.measureText(line).width;
}

const TypeOut = new class {
	#gen  = this.#generator();
	#data = {lineIdx:0};
	get gen()  {return this.#gen}
	get data() {return this.#data}
	reset() {
		TypeOut.#gen.return();
		TypeOut.#gen  = TypeOut.#generator();
		TypeOut.#data = {lineIdx:0};
	}
	*#generator() {
		for (const [lineIdx,data] of Lines.entries()) {
			const {line}= data;
			for (let i=0; i<line.length+1; i++) {
				const string = line.substr(0, line[0] == '*' ? 0 : i);
				yield this.#data ={...data,string,lineIdx};
			}
		}
	}
}
export const Title = freeze(new class {
	#drawInvaders() {
		InvadersLines.forEach(l=> this.#drawInvader(l));
	}
	#drawInvader({row,line,invType}) {
		const tW = getTextWidth(ctx, {line,invType});
		const sz = Sprite.getSize(invType);
		const oX = (UfoSize.x/2 - sz.x/2) - UfoSize.x/2;
		const oY = (FontSize /2 - sz.y/2) + MarginV;
		ctx.save();
		ctx.translate((cvs.width/2 - tW/2) + oX, getY(row-1) + oY);
		Sprite.draw(ctx, invType, 0);
		ctx.restore();
	}
	#drawText({row,color,line,invType}, str=line) {
		const tW = getTextWidth(ctx, {line,invType});
		const oX = isNum(invType) ? UfoSize.x/2 : 0;
		ctx.fillStyle = Sprite.InvaderColors[invType] ?? color;
		ctx.fillText(str, (cvs.width/2 - tW/2) + oX, getY(row));
	}
	draw() {
		const data = TypeOut.data;
		const {line,lineIdx,string,invType}= data;
		ctx.save();
		ctx.translate(0, FontSize * 6);

		(Ticker.count % 8 == 0 || line?.[0] == '*')
			&& TypeOut.gen.next().done
			&& Timer.set(1000, TypeOut.reset);

		isNum(invType) && this.#drawInvaders();
		string && this.#drawText(data, string);
		for (let i=0; i<lineIdx; i++) {
			this.#drawText(Lines[i])
		}
		ctx.restore();
	}
});
$on('Title', TypeOut.reset);