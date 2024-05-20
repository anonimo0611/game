class _Param  {
	static get Step() {
		return [T/7.1, T/6.8, T/6.6][MAZE_IDX];
	}
	PacStep = new class {
		Base        = _Param.Step;
		Eating      = this.Base * [.89, .94, .95][MAZE_IDX];
		Energized   = this.Base * 1.05;
		EnergEating = this.Energized * 0.90;
	}
	GhsStep = new class {
		Base       = _Param.Step;
		Fright     = this.Base * 0.60;
		InTunnel   = this.Base * 0.40;
		GoOut      = this.Base / 1.50;
		Escape     = this.Base * 1.40;
		ReturnHome = this.Escape;
	}
	ElroyDotRates = [1.50, 3.00, 5.00];
	ElroySpdRates = [1.00, 1.02, 1.05, 1.08];
	ghsModeTime(idx) {
		return [
			5000, // Scatter
			25e3, // Chase
			4000, // Scatter
			25e3, // Chase
			3000, // Scatter
			25e3, // Chase
			3000, // Scatter
			Infinity // Chase
		][idx] * [1.00, 1.05, 1.10][MAZE_IDX];
	}
	FrightTime = [4000, 5000, 7000][MAZE_IDX];
};
export let Param = deepFreeze(new _Param);
$on('Resize', _=> Param = deepFreeze(new _Param));