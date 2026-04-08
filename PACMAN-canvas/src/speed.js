const PacBase = TileSize / 4.5
const GhsBase = PacBase * 1.07

import {Game} from './_main.js'
export default /**@type {const}*/({
	StepPerLevel: 0.01,
	Pacman: {
		Base:      PacBase,
		Eating:    PacBase * 0.86,
		Energized: PacBase * 1.10,
		EneEating: PacBase * 0.95, // Energized+Eating
		get levelFactor() {
			return (Game.level < 13 ? 1 : 0.98)
		},
	},
	Ghost: {
		Base:     GhsBase,
		Idle:     GhsBase * 0.50,
		GoOut:    GhsBase * 0.50,
		Fright:   GhsBase * 0.60,
		InTunnel: GhsBase * 0.60,
		Escape:   GhsBase * 1.40,
	},
})