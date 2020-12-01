import expect from 'expect'
import { generateTestingWorld } from './testUtils'
import {
	generateSimpleMoveZone,
	generateMoveZone,
	generateMoveZoneForTower,
	generateMoveZoneInsideKingdom,
} from '../src/utils/helpers'
import Hex from '../src/engine/Hex'
import Unit from '../src/engine/Unit'
import Tower from '../src/engine/Tower'
import TreeUtils from '../src/engine/TreeUtils'
import Grave from '../src/engine/Grave'

describe('Helpers', () => {
	describe('generateSimpleMoveZone', () => {
		it('Should generate a move zone only for the adjacent hexs', () => {
			const world = generateTestingWorld('constant-seed-7')
			const hex1 = new Hex(2, -2, 0)
			const kingdom = world.getKingdomAt(hex1)

			expect(generateSimpleMoveZone(world, kingdom, 1).length).toBe(5)
		})

		it('Should generate a adjacent move zone with proper level', () => {
			const world = generateTestingWorld('constant-seed-7')
			const hex1 = new Hex(2, -2, 0)
			const kingdom = world.getKingdomAt(hex1)

			expect(generateSimpleMoveZone(world, kingdom, 4).length).toBe(10)
		})
	})

	describe('generateMoveZone', () => {
		it('Should generate a move zone both adjacent and inside kingdom', () => {
			const world = generateTestingWorld('constant-seed-7')
			const hex1 = new Hex(2, -2, 0)
			const kingdom = world.getKingdomAt(hex1)

			expect(generateMoveZone(world, kingdom, 1).length).toBe(10)
		})

		it('Should generate a move zone both adjacent and inside kingdom with proper level', () => {
			const world = generateTestingWorld('constant-seed-7')
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const hex3 = new Hex(2, -4, 2)
			const unit1 = new Unit(4)
			const unit2 = new Unit(4)
			const unit3 = new Unit(3)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(world.getHexAt(hex1), unit1)
			world.setEntityAt(world.getHexAt(hex2), unit2)
			world.setEntityAt(world.getHexAt(hex3), unit3)

			expect(generateMoveZone(world, kingdom, 1).length).toBe(8)
		})
	})

	describe('generateMoveZoneForTower', () => {
		it('Should generate a move zone on each empty hexs for tower', () => {
			const world = generateTestingWorld('constant-seed-7')
			const hex1 = new Hex(2, -2, 0)
			const kingdom = world.getKingdomAt(hex1)

			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex1))

			expect(generateMoveZoneForTower(kingdom).length).toBe(4)
		})

		it('Should generate an empty move zone if all hexs are reserved', () => {
			const world = generateTestingWorld('constant-seed-7')
			const hex1 = new Hex(2, -2, 0)
			const kingdom = world.getKingdomAt(hex1)

			kingdom.hexs
				.filter((hex) => hex.entity === null)
				.forEach((hex) => TreeUtils.spawnTreeOnWorldHex(world, hex))

			expect(generateMoveZoneForTower(kingdom).length).toBe(0)
		})
	})

	describe('generateMoveZoneInsideKingdom', () => {
		it('Should generate a move zone on each empty hexs, hex with trees or graves, and mergables', () => {
			const world = generateTestingWorld('constant-seed-7')
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -3, 1)
			const hex3 = new Hex(2, -4, 2)
			const hex4 = new Hex(0, -3, 3)
			const tower1 = new Tower()
			const unit1 = new Unit(2)
			const grave1 = new Grave()
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex2, tower1)
			world.setEntityAt(hex3, unit1)
			world.setEntityAt(hex4, grave1)
			TreeUtils.spawnTreeOnWorldHex(world, world.getHexAt(hex1))

			expect(generateMoveZoneInsideKingdom(kingdom, 2).length).toBe(4)
		})
	})
})
