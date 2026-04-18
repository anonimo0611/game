const PBase = TileSize / 4.5
const GBase = PBase * 1.07

import {Game} from './_main.js'
export default /**@type {const}*/({
	StepPerLevel: 0.01,
	Pacman: {
		Base:      PBase,
		Eating:    PBase * 0.86,
		Energized: PBase * 1.10,
		EneEating: PBase * 0.95, // Energized+Eating
		get levelFactor() {
			return (Game.level < 13 ? 1 : 0.98)
		},
	},
	Ghost: {
		Base:     GBase,
		Idle:     GBase * 0.50,
		GoOut:    GBase * 0.50,
		Fright:   GBase * 0.60,
		InTunnel: GBase * 0.60,
		Escape:   GBase * 1.40,
	},
})