import {Ticker}    from '../lib/timer.js';
import {Timer}     from '../lib/timer.js';
import {rgba}      from '../lib/color.js';
import {cvs,ctx}   from './_canvas.js';
import {Window}    from './_window.js';
import {Scene}     from './scene.js';
import * as Sprite from './invader_sprite.js';

const SP        = '\u2002';
const FontSize  = Window.FontSize;
const LineSpace = FontSize * 0.7;
const InvType   = Sprite.InvaderType;
const UfoWidth  = Sprite.getSize(InvType.Ufo).x;

const HeaderLines = [
	{row:0, color:'#0F0', lineText:'PLAY'},
	{row:1, color:'#0F0', lineText:'SPACE　INVADERS'},
	{row:3, color:'#7ED', lineText:`*SCORE${SP}ADVANCE${SP}TABLE*`},
];
const InvadersLines = [
	{row:4, invType:InvType.Ufo,    lineText:`=?${SP}MYSTERY`},
	{row:5, invType:InvType.Squid,  lineText:`=30${SP}POINTS`},
	{row:6, invType:InvType.Crab,   lineText:`=20${SP}POINTS`},
	{row:7, invType:InvType.Octpus, lineText:`=10${SP}POINTS`},
];
const Lines = [...HeaderLines, ...InvadersLines];
const InvadersSectionWidth = InvadersLines
	.map(l=> ctx.measureText(l.lineText).width)
	.sort((a,b)=> b-a)[0];

function getYPosition(row) {
	return (row*FontSize) + (row*LineSpace);
}
function getLineWidth(ctx, {lineText,invType}) {
	return isNum(invType)
		? InvadersSectionWidth
		: ctx.measureText(lineText).width;
}

const TypeOut = new class {
	static {$on('Title', ()=> TypeOut.#reset())}
	#gen  = this.#generator();
	#data = {lineIdx:0};
	get data() {return this.#data}

	#reset() {
		this.#gen.return();
		this.#gen  = this.#generator();
		this.#data = {lineIdx:0};
	}
	update() {
		if (!Scene.isTitle) {return}
		(Ticker.count % 8 == 0 || this.data.lineText?.[0] == '*')
			&& this.#gen.next().done
			&& Timer.set(1000, ()=> this.#reset());
	}
	*#generator() {
		for (const [lineIdx,data] of Lines.entries()) {
			const {lineText:l}= data;
			for (let i=0; i<l.length+1; i++) {
				const currentText = l.substr(0, l[0] == '*' ? 0 : i);
				yield this.#data ={...data,currentText,lineIdx};
			}
		}
	}
};
export const Title = freeze(new class {
	#drawInvader({row,lineText,invType}) {
		const tW = getLineWidth(ctx, {lineText,invType});
		const sz = Sprite.getSize(invType);
		const oX = (UfoWidth-sz.x)/2 - UfoWidth/2;
		const oY = (FontSize-sz.y)/2 + LineSpace;
		ctx.save();
		ctx.translate((cvs.width-tW)/2 + oX, getYPosition(row-1) + oY);
		Sprite.draw(ctx, invType, 0);
		ctx.restore();
	}
	#drawText({row,color,lineText,currentText,invType}) {
		if (currentText != '') {
			currentText ||= lineText; 
			const tW = getLineWidth(ctx, {lineText,invType});
			const oX = isNum(invType) ? UfoWidth/2 : 0;
			ctx.fillStyle = Sprite.InvaderColors[invType] ?? color;
			ctx.fillText(currentText, (cvs.width-tW)/2 + oX, getYPosition(row));
		}
	}
	#drawLines(data) {
		const {lineIdx,invType,currentText}= data;
		isNum(invType) && InvadersLines.forEach(l=> this.#drawInvader(l));
		this.#drawText(data);
		integers(lineIdx).forEach(i=> this.#drawText(Lines[i]));
	}
	update() {
		TypeOut.update();
	}
	draw() {
		if (!Scene.isTitle) {return}
		ctx.save();
		ctx.translate(0, FontSize*6.5);
		this.#drawLines(TypeOut.data);
		ctx.restore();
	}
});