const P_SPD = TILE_SIZE / 4.5
const G_SPD = P_SPD * 1.07

import {Game} from './_main.js'
export const Speed = /**@type {const}*/({
	get stepPerLv() {
		return 1-(13-Game.clampedLv) * 0.01
	},
	Pacman: {
		Base:      P_SPD,
		Eating:    P_SPD * 0.88,
		Energized: P_SPD * 1.10,
		EneEating: P_SPD * 0.95, // Energized+Eating
		get levelFactor() {
			return (Game.level < 13 ? 1 : 0.98)
		},
	},
	Ghost: {
		Base:     G_SPD,
		Idle:     G_SPD * 0.50,
		GoOut:    G_SPD * 0.50,
		Fright:   G_SPD * 0.60,
		InTunnel: G_SPD * 0.60,
		Escape:   G_SPD * 1.40,
	},
}), {Ghost:GhsSpd, Pacman:PacSpd}= Speed