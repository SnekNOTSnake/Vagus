import expect from 'expect'
import World from '../src/engine/World'
import Player from '../src/engine/Player'
import Hex from '../src/engine/Hex'
import TreeUtils from '../src/engine/TreeUtils'
import { generateTestingWorld } from './testUtils'

describe('WorldGenerator', () => {
	describe('generateHexagonWorldNoInitialTree', () => {
		it('Returns a well formed world', () => {
			const world = generateTestingWorld()

			expect(world).toBeInstanceOf(World)
			expect(world.config.players[0]).toBeInstanceOf(Player)
			expect(world.hexs[0]).toBeInstanceOf(Hex)
			expect(world.config.players[1]).toHaveProperty('color', 1)
			// Number of hex must be a multiple of player number
			expect(world.hexs.length % world.config.players.length).toBe(0)
			expect(world.hexs[0]).toHaveProperty('player')
		})

		it('Spawns trees all over the world when the treesInitialSpawnProbability is set to 1.0', () => {
			const world = generateTestingWorld()
			world.config.treesInitialSpawnProbability = 1
			const emptyHexs = world.hexs.filter((hex) => hex.entity === null)

			TreeUtils.spawnInitialTrees(world)

			expect(emptyHexs.every((hex) => hex.hasTree()))
		})
	})
})
