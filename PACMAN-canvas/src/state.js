import _State from '../_lib/state.js'
export const State = new class extends _State {
	isTitle     = true
	isAttract   = false
	isStart     = false
	isRestart   = false
	isNewLevel  = false
	isReady     = false
	isPlaying   = false
	isClear     = false
	isFlashMaze = false
	isCrashed   = false
	isLosing    = false
	isGameOver  = false
	isCoffBrk   = false
	isQuit      = false
	constructor() {
		super()
		this.init()
	}
	get isSt_Ready() {
		return this.isStart || this.isReady
	}
	#callback(state, data) {
		Ticker.resetCount()
		$trigger(document.body.dataset.state=state, data)
	}
	switchTo(state, {delay=(state=='Quit' ? -1:0),data}={}) {
		return super.switchTo(state, {delay,data,fn:this.#callback})
	}
}