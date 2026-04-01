const PacSpd = TileSize / 4.5
const GhsSpd = PacSpd * 1.07

export default /**@type {const}*/({
	Pacman: {
		SlowLevel: 13,   // After this level, Pacman slows down
		SlowRate:  0.98, // Deceleration rate at SlowLevel
		Base:      PacSpd,
		Eating:    PacSpd * 0.86,
		Energized: PacSpd * 1.10,
		EneEating: PacSpd * 0.95, // Energized+Eating
	},
	Ghost: {
		Base:     GhsSpd,
		Idle:     GhsSpd * 0.50,
		GoOut:    GhsSpd * 0.50,
		Fright:   GhsSpd * 0.60,
		InTunnel: GhsSpd * 0.60,
		Escape:   GhsSpd * 1.40,
	},
})