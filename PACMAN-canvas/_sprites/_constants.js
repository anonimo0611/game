import {TileSize} from '../src/_constants.js'
import {Cvs}      from '../src/_canvas.js'
import {pvCvs}    from './anime.js'
import {drawSprites}     from './_main.js'
import * as Actor from './actor.js'

export const ColMax = 10
export const RowMax = 11

export let T=TileSize, [S,Gap]=[T*2,T*.25]
export let ghost    = new Actor.Ghost(T*2)
export let cbAkabei = new Actor.Akabei(T*2)
export let pacman   = new Actor.Pacman()

$('#sizeRng').on('input', ()=> {
	const size = byId('sizeRng').valueAsNumber
	T=size/2, [S,Gap]=[size,T*0.25]
	ghost    = new Actor.Ghost(T*2)
	cbAkabei = new Actor.Akabei(T*2)
	pacman   = new Actor.Pacman()
	setCanvasSize(Cvs)(ColMax*S, RowMax*S)
	setCanvasSize(pvCvs)(T*3, T*2)
	drawSprites()
});setCanvasSize(Cvs)(ColMax*S, RowMax*S)