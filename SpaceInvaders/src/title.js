import {Ticker}    from '../lib/timer.js';
import {Timer}     from '../lib/timer.js';
import {rgba}      from '../lib/color.js';
import {cvs,ctx}   from './_canvas.js';
import {Window}    from './_window.js';
import {Scene}     from './scene.js';
import * as Sprite from './invader_sprite.js';

const SP = '\u2002';
const FontSize = Window.FontSize;
const OffsetY  = FontSize * 6;
const MarginV  = FontSize *.7;
const InvType  = Sprite.InvaderType;
const UfoSize  = Sprite.getSize(InvType.Ufo);

const Lines = [
	{row:0.0, color:'#00FF00',   line:'PLAY'},
	{row:1.5, color:'#00FF00',   line:'SPACE　INVADERS'},
	{row:3.5, color:'#68E0FC',   line:`*SCORE${SP}ADVANCE${SP}TABLE*`},
	{row:4.5, inv:InvType.Ufo,   line:`=?${SP}MYSTERY`},
	{row:5.5, inv:InvType.Squid, line:`=30${SP}POINTS`},
	{row:6.5, inv:InvType.Crab,  line:`=20${SP}POINTS`},
	{row:7.5, inv:InvType.Octpus,line:`=10${SP}POINTS`},
];
const getY = row=> (row*FontSize) + (row*MarginV);
const getTextWidth = (ctx, {line,inv})=>
	ctx.measureText(inv >= 0 ? Lines[3].line : line).width;

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
				yield this.#data = {...data,string,lineIdx};
			}
		}
	}
}
export const Title = freeze(new class {
	#drawInvader({row,color,line,inv}) {
		const tW = getTextWidth(ctx, {line,inv});
		const sz = Sprite.getSize(inv);
		const oX = (UfoSize.x/2 - sz.x/2) - UfoSize.x/2;
		const oY = (FontSize /2 - sz.y/2) + MarginV;
		ctx.save();
		ctx.translate((cvs.width/2 - tW/2) + oX, getY(row-1) + oY);
		Sprite.draw(ctx, inv, 0);
		ctx.restore();
	}
	#drawText({row,color,line,inv}, str=line) {
		const tW = getTextWidth(ctx, {line,inv});
		const oX = (inv >= 0) ? UfoSize.x/2 : 0;
		ctx.fillStyle = Sprite.InvaderColors[inv] ?? color;
		ctx.fillText(str, (cvs.width/2 - tW/2) + oX, getY(row));
	}
	draw() {
		const data = TypeOut.data;
		const {line,lineIdx,string,inv}= data;
		ctx.save();
		ctx.translate(0, OffsetY)

		if (Ticker.count % 8 == 0 || line?.[0] == '*')
			TypeOut.gen.next().done
				&& Timer.set(1000, TypeOut.reset);

		if (inv >= 0)
			for (let i=3; i<Lines.length; i++)
				this.#drawInvader(Lines[i]);

		string && this.#drawText(data, string);
		for (let i=0; i<lineIdx; i++)
			this.#drawText(Lines[i]);

		ctx.restore();
	}
});
$on('Title', TypeOut.reset);