import Player from '../src/engine/Player'
import WorldGenerator from '../src/engine/WorldGenerator'

const createTestPlayers = () => {
	return Array.from(new Array(6)).map(() => new Player())
}

const generateTestingWorld = (seed = null, players = createTestPlayers()) => {
	return WorldGenerator.generateHexagonWorldNoInitialTree(seed, players)
}

export { createTestPlayers, generateTestingWorld }
