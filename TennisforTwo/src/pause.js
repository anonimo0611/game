import {Ticker}  from '../lib/timer.js';
import {Timer}   from '../lib/timer.js';
import {Sound}   from '../snd/sound.js';
import {Scene}   from './scene.js';
import {Score}   from './score.js';
import {Message} from './message.js';
import {Pointer} from './pointer.js';
import {Button}  from './buttons.js';

let $animIdx = 0;
let $counter = 0;
let $blurred = 0;
let $paused  = false;
let $byCtrl  = false;
let $pointer = true;

const ResumeTime = 1000; // ms

export const Pause = new class {
	static {$ready(this.#setup)}
	static #setup() {
		$on({
			Title:       Pause.#reset,
			blur:        Pause.#onBlur,
			focus:       Pause.#onFocus,
			keydown:     Pause.#onKeydown,
			touchstart:  Pause.#onTouchStart,
			touchend:    Pause.#onDown,
			pointerdown: Pause.#onDown,
		});
	}
	get paused()      {return $paused}
	get showPointer() {return $pointer}
	#reset() {
		$byCtrl  = false;
		$pointer = true;
		$paused  = !document.hasFocus();
	}
	#set(paused, {byCtrl=false}={}) {
		$paused  = paused;
		$byCtrl  = byCtrl;
		$pointer = !paused;
		$animIdx = $counter = 0;
		Timer.frozen = paused;
		Timer.cancel(Pause);
		Sound.pauseAll(paused);
	}
	pause() {
		!$paused
			? Pause.#set(!$paused, {byCtrl:true})
		 	: Pause.#resumeTimer(!$paused);
	}
	#resumeTimer(...args) {
		$pointer = true;
		Timer.cancel(Pause);
		Timer.set(ResumeTime, ()=> Pause.#set(...args), {id:Pause});
	}
	#onBlur() {
		($blurred=1) && !$paused && Pause.#set(true);
	}
	#onFocus() {
		!Scene.isInGame
			?  Pause.#set(false)
			: !$byCtrl && Pause.#resumeTimer(false);
	}
	#onTouchStart() {
		if (Button.hover) return;
		if ($paused) Pause.pause();
	}
	#onDown(e) {
		if (Button.hover) return;
		if (Pointer.isTouchDevice && e.type == 'pointerdown') return;
		if (Timer.has(Pause)) {
			if ($blurred--) return;
			Pause.#set(false);
			$(Pause).trigger('shot');
		}
		$paused && !$blurred && Pause.pause();
		$blurred = 0;
	}
	#onKeydown(e) {
		if (Pointer.isTouchDevice  || !Scene.isInGame)   return;
		if (e.originalEvent.repeat || e.key != 'Escape') return;
		if (Timer.has(Pause)) return Pause.#set($paused);
		Pause.pause();
	}
	draw() {
		if (!Scene.isInGame || Timer.has(Pause)) return;
		$paused && $animIdx && Message.draw('PAUSED');
		$animIdx ^= $counter++ % 30 == 0;
	}
};