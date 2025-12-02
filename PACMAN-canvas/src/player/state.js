import {Ctrl}   from '../control.js'
import {State}  from '../state.js'

export class PlayerState {
	get radius()      {return PacRadius}
	get hidden()      {return Timer.frozen}
	get maxAlpha()    {return this.isSemiTrans? .75:1}
	get showCenter()  {return Ctrl.showGridLines}
	get isSemiTrans() {return Ctrl.invincible   || this.showCenter}
	get dying()       {return State.isPacCaught || State.isPacDying}
	get mouseClosed() {return State.isPlaying == false}
}