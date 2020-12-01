import expect from 'expect'
import { generateTestingWorld } from '../testUtils'
import { AiEasyTest } from '../../src/engine/ai/AiTest'
import Player from '../../src/engine/Player'
import Hex from '../../src/engine/Hex'
import Arbiter from '../../src/engine/Arbiter'
import Unit from '../../src/engine/Unit'
import TreeUtils from '../../src/engine/TreeUtils'
import Tree from '../../src/engine/Tree'

const players = [
	new AiEasyTest(), // Blue (0)
	new Player(), // Red (1)
	new Player(),
	new Player(),
	new Player(),
	new Player(),
]

describe('AI Easy', () => {
	describe('decideAboutUnit', () => {
		it('Should do a normal move if Math.random is less than 0.5', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(1, -3, 2)
			const unit1 = new Unit(1)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			Math.random = () => 0.1
			ai.decideAboutUnit(arbiter, world.getHexAt(hex1))

			expect(world.getEntityAt(hex2)).toBe(unit1)
		})

		it('Should do a random adjacent hexs move if Math.random is more than 0.5 and no trees to cut', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const unit1 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			Math.random = () => 0.9
			ai.decideAboutUnit(arbiter, world.getHexAt(hex1))

			expect(world.getEntityAt(hex1)).toBeNull()
			expect(kingdom.hexs.length).toBe(7)
		})
	})

	describe('tryToBuildUnits', () => {
		it("Should only build units inside kingdom and do nothing about them, unless it's a kingdom kickstart", () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const unit1 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			Math.random = () => 0.1
			ai.tryToBuildUnits(arbiter, kingdom)

			expect(kingdom.hexs.some((hex) => hex.hasUnit())).toBe(true)
			expect(kingdom.gold).toBe(0)
		})

		it("Should ignore the condition where kingdom should be able to afford new unit if it's a kingdom kickstart", () => {
			const world = generateTestingWorld('constant-seed-2', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(1, -2, 1)
			const hex2 = new Hex(2, -1, -1)
			const hex3 = new Hex(2, -2, 0)
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex1))
			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex3))
			ai.tryToBuildUnits(arbiter, kingdom)

			expect(world.getEntityAt(hex2)).toBeInstanceOf(Unit)
			expect(world.getEntityAt(hex1)).toBeInstanceOf(Tree)
			expect(world.getEntityAt(hex3)).toBeInstanceOf(Tree)
		})
	})

	describe('tryToBuildTowers', () => {
		it('Should not build any tower at all', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(1, -2, 1)
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			ai.tryToBuildTowers(arbiter, kingdom)
			ai.tryToBuildTowers(arbiter, kingdom)
			ai.tryToBuildTowers(arbiter, kingdom)

			expect(kingdom.hexs.some((hex) => hex.hasTower())).toBe(false)
		})
	})

	describe('mergeUnits', () => {
		it('Should merge units if Math.random returns less than 0.25', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const unit1 = new Unit(1)
			const unit2 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			Math.random = () => 0.1
			ai.mergeUnits(arbiter, kingdom)

			expect(
				kingdom.hexs.some((hex) => hex.hasUnit() && hex.entity.level === 2),
			).toBe(true)
			expect(kingdom.hexs.filter((hex) => hex.hasUnit()).length).toBe(1)
		})

		it('Should not merge units if Math.random returns more than 0.25', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const unit1 = new Unit(1)
			const unit2 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			Math.random = () => 0.9
			ai.mergeUnits(arbiter, kingdom)

			expect(
				kingdom.hexs.some((hex) => hex.hasUnit() && hex.entity.level === 2),
			).toBe(false)
			expect(kingdom.hexs.filter((hex) => hex.hasUnit()).length).toBe(2)
		})

		it('Should only merge level 1 unit with other level 1', () => {
			const world = generateTestingWorld('constant-seed-7', players)
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const unit1 = new Unit(2)
			const unit2 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(20)
			const ai = arbiter.currentPlayer

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			Math.random = () => 0.1
			ai.mergeUnits(arbiter, kingdom)

			expect(
				kingdom.hexs.some((hex) => hex.hasUnit() && hex.entity.level === 3),
			).toBe(false)
			expect(kingdom.hexs.filter((hex) => hex.hasUnit()).length).toBe(2)
		})
	})
})
