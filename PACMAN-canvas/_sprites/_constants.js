import {pvCtx}    from './anime.js'
import {View}     from './_main.js'
import * as Actor from './actor.js'

export const Cols    = 10
export const Rows    = 11
export const sizeRng = byId('sizeRng')

export let T=0,[S,Gap]=[0,0]
export let ghost    = new Actor.Ghost
export let cbAkabei = new Actor.Akabei

function resize() {
	T = sizeRng.valueAsNumber/2,
	[S,Gap]  = [T*2,T*.25]
	ghost    = new Actor.Ghost (T*2)
	cbAkabei = new Actor.Akabei(T*2)
	Ctx.resize(Cols*S+Gap*2, Rows*S+Gap)
	pvCtx.resize(T*3, T*2),View.draw()
}
$('#sizeRng').on('input',resize) && $ready(resize)