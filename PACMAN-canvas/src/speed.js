const P_BASE = TileSize / 4.5
const G_BASE = P_BASE * 1.07

import {Game} from './_main.js'
export default /**@type {const}*/({
	StepPerLevel: 0.01,
	Pacman: {
		Base:      P_BASE,
		Eating:    P_BASE * 0.86,
		Energized: P_BASE * 1.10,
		EneEating: P_BASE * 0.95, // Energized+Eating
		get levelFactor() {
			return (Game.level < 13 ? 1 : 0.98)
		},
	},
	Ghost: {
		Base:     G_BASE,
		Idle:     G_BASE * 0.50,
		GoOut:    G_BASE * 0.50,
		Fright:   G_BASE * 0.60,
		InTunnel: G_BASE * 0.60,
		Escape:   G_BASE * 1.40,
	},
})