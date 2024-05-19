import {ctx}    from './_canvas.js';
import {player} from './player.js';
import {enemy}  from './enemy.js';

export const spacePad = (n, parm)=>
	toFullWidth(parm).padStart(n, '\u3000');

export const textWidth = (ctx, text)=>
	ctx.measureText(text).width;

export const toFullWidth = str=>
	 String(str).replace(/[!-~]/g, s=>
		String.fromCharCode(s.charCodeAt(0) + 0xFEE0));

export const sleep = ms=>
	new Promise(res=> setTimeout(res, ms));

export const waitEnterKey = ()=>
	new Promise(resolve=> {
		$offon('keydown.Enter', e=> {
			if (player.healing || player.damaging || enemy.damaging)
				return;
			e.key == 'Enter' && resolve();
		})
	});