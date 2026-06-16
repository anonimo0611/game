const BASE_P = TILE_SIZE / 4.5
const BASE_G = BASE_P * 1.07

import {Game} from './_main.js'
export const Speed = /**@type {const}*/({
	StepPerLevel: 0.01,
	Pacman: {
		Base:      BASE_P,
		Eating:    BASE_P * 0.86,
		Energized: BASE_P * 1.10,
		EneEating: BASE_P * 0.95, // Energized+Eating
		get levelFactor() {return (Game.level < 13 ? 1 : 0.98)},
	},
	Ghost: {
		Base:     BASE_G,
		Idle:     BASE_G * 0.50,
		GoOut:    BASE_G * 0.50,
		Fright:   BASE_G * 0.60,
		InTunnel: BASE_G * 0.60,
		Escape:   BASE_G * 1.40,
	},
}), {Ghost:GhsSpd, Pacman:PacSpd}= Speed