import {TileSize} from '../src/_constants.js'
import {Cvs}      from '../src/_constants.js'
import {pvCvs}    from './anime.js'
import {View}     from './_main.js'
import * as Actor from './actor.js'

const sizeRng = byId('sizeRng')

export const Cols = 10
export const Rows = 11

export let T=TileSize, [S,Gap]=[T*2,T*.25]
export let ghost    = new Actor.Ghost (T*2)
export let cbAkabei = new Actor.Akabei(T*2)

function resize() {
	const size = sizeRng.valueAsNumber
	T=size/2, [S,Gap]=[size,T*.25]
	ghost    = new Actor.Ghost (T*2)
	cbAkabei = new Actor.Akabei(T*2)
	setCanvasSize(Cvs)(Cols*S+Gap*2, Rows*S+Gap)
	setCanvasSize(pvCvs)(T*3, T*2)
	requestAnimationFrame(View.draw)
}
$('#sizeRng').on('input', resize) && $ready(resize)