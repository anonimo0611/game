import {Ticker}   from '../lib/timer.js';
import {cvs,ctx}  from './_canvas.js';
import {FontSize} from './_canvas.js';
import * as Util  from './_util.js';
import {Phase}    from './phase.js';
import {Command}  from './command.js';
import {player}   from './player.js';
import {enemy}    from './enemy.js';

const FS = FontSize;
const SpellCost = 10;
const {spacePad,textWidth,toFullWidth,sleep,waitEnterKey}= Util;

export const Message = new class {
	#data = [];
	get data() {return this.#data}
	async set() {
		if (!enemy.appeared) {
			await sleep(1000);
			enemy.appeared = true;
			await sleep(700);
		}
		if (Phase.isStart) {
			this.#data = ['りゅうおうが しょうたいを','あらわした！'];
			await waitEnterKey();
			Phase.switchToSelect();
			return;
		}
		if (!Phase.isBattle) return;
		if (Command.current == Command.Enum.Attack) {
			this.#data = ['ゆうしゃのこうげき！'];
			await waitEnterKey();
			const damageBase = int(player.attack - enemy.defence/2);
			const damage = randInt(damageBase/4, damageBase/2);
			enemy.hp -= damage;
			$trigger('EnemyDamage');
			this.#data = [this.#data[0],
				`りゅうおうに　${toFullWidth(damage)}ポイントの`,
				'ダメージを　あたえた！'
			];
			if (enemy.hp <= 0) {
				await waitEnterKey();
				this.#data = ['りゅうおうを たおした！'];
				enemy.killed = true;
				await waitEnterKey();
				this.#data = [
					'ひかりのたまを　とりもどし',
					'せかいに　へいわが　もどったのだ！'
				];
				await waitEnterKey();
				Phase.switchToClear();
				return;
			}
		}
		if (Command.current == Command.Enum.Spell) {
			if (player.mp < SpellCost) {
				this.#data = ['ＭＰが　たりない！'];
				await waitEnterKey();
				Phase.switchToSelect();
				return;
			}
			this.#data = ['ゆうしゃは　ベホイミの','じゅもんを　となえた！'];
			player.mp -= SpellCost;
			$trigger('PlayerHeal');
			let heal = 85 + randInt(0,15);
			if (heal + player.hp > player.maxHp)
				heal = player.maxHp - player.hp;
			player.hp += heal;
			await waitEnterKey();
			this.#data = [...this.#data,
				`${toFullWidth(heal)}ポイント　かいふくした！`
			];
		}
		await waitEnterKey();
		if (randInt(0,1)) {
			this.#data = ['　りゅうおうのこうげき！'];
			await waitEnterKey();
			const damageBase = int(enemy.attack - player.defence/2);
			const damage = randInt(damageBase/4, damageBase/2);
			player.hp = max(player.hp-damage, 0);
			$trigger('PlayerDamage');
			this.#data = [this.#data[0],
				`　ゆうしゃは　${toFullWidth(damage)}ポイントの`,
				'　ダメージを　うけた！'
			];
		} else {
			this.#data = ['　りゅうおうは　ほのおをはいた！'];
			await waitEnterKey();
			const damage = int((64 + randInt(0,7)) * 2/3);
			player.hp = max(player.hp-damage, 0);
			$trigger('PlayerDamage');
			this.#data = [this.#data[0],
				`　ゆうしゃは　${toFullWidth(damage)}ポイントの`,
				'　ダメージを　うけた！'
			];
		}
		await waitEnterKey();
		if (player.hp <= 0) {
			this.#data = ['ゆうしゃは　たおれた…'];
			await waitEnterKey();
			Phase.switchToGameOver();
			return;
		}
		Phase.switchToSelect();
	}
	draw() {
		if (Ticker.count < 60 || Phase.isSelect) return;
		if (!isArray(this.data) || !this.data.length) return;
		const [lineW,x,y]= [FS/10, FS/2, cvs.height - FS*4]; 
		const width  = textWidth(ctx, '　'.repeat(20));
		const height = FS*3 + lineW*2.5;
		ctx.save();
		ctx.translate(x+player.offset, y+player.offset);
		ctx.lineWidth   = lineW;
		ctx.fillStyle   = player.color;
		ctx.strokeStyle = player.color;
		strokeRoundRect(ctx, FS/4, FS/8-lineW, width,height, 5);
		this.data.forEach((text, i)=> {
			ctx.fillText('　'+text, 0, FS + FS*i);
		});
		ctx.restore();
	}
}
export const GameWindow = new class {
	draw() {
		this.#draw('ゆうしゃ', [
			['レベル', spacePad(4,player.level)],
			['ＨＰ　', spacePad(4,player.hp)],
			['ＭＰ　', spacePad(4,player.mp)],
		], FS/2, FS);
		if (Phase.isSelect) {
			this.#draw(
				'コマンド',
				[...Command.Items.map((txt,i)=>
					[i==Command.current ? '｝':'　', txt])],
				FS/2, cvs.height - FS*3
			);
		}
	}
	#draw(legend, data, x, y) {
		const lineW  = FS/10; 
		const labelW = max(...data.map(v=> textWidth(ctx, v[0])));
		const width  = max(...data.map(v=> textWidth(ctx, v.join(''))))+FS/2;
		const height = (data.length*FS) + lineW*2.5;

		// content
		ctx.save();
		ctx.translate(x+player.offset, y+player.offset);
		ctx.lineWidth   = lineW;
		ctx.fillStyle   = player.color;
		ctx.strokeStyle = player.color;
		strokeRoundRect(ctx, FS/4, 0, width,height, 5, player.color);
		data.forEach(([label,desc], i)=> {
			const y = FS+FS*i;
			ctx.fillText(label, FS/2, y);
			ctx.fillText(desc, labelW+FS/2, y);
		});
		// legend
		{
			const legendW = textWidth(ctx, legend);
			ctx.save();
			ctx.translate(FS/4 + (width-legendW)/2, 0);
			ctx.beginPath();
				ctx.strokeStyle = 'black';
				ctx.moveTo(-2, 0);
				ctx.lineTo(legendW, 0);
			ctx.stroke();
			ctx.fillText(legend, 0, FS/4);
			ctx.restore();
		}
		ctx.restore();
	}
}