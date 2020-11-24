import expect from 'expect'
import Arbiter from '../src/engine/Arbiter'
import Hex from '../src/engine/Hex'
import Unit from '../src/engine/Unit'
import Tree from '../src/engine/Tree'
import Tower from '../src/engine/Tower'
import { generateTestingWorld } from './testUtils'

describe('ArbiterTower', () => {
	describe('placeAt', () => {
		it('Cannot place an unit on a tower', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const unit1 = new Unit(1)
			const tower1 = new Tower()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			world.setEntityAt(hex1, tower1)

			expect(() => arbiter.placeAt(hex1)).toThrow(
				/Trying to place unit in a hex reserved by a tower/i,
			)
			expect(world.getEntityAt(hex1)).toBe(tower1)
			expect(arbiter.selection).toBe(unit1)
		})

		it('Cannot capture a hex with a tower or place it in non-empty hex', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(1, -1, 0)
			const hex3 = new Hex(3, -1, -2)
			const tower1 = new Tower()
			const tree1 = new Tree()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(tower1)
			world.setEntityAt(hex3, tree1)

			expect(() => arbiter.placeAt(hex2)).toThrow(
				/Trying to place tower outside current kingdom/i,
			)
			expect(world.getEntityAt(hex2)).toBeNull()
			expect(arbiter.selection).toBe(tower1)

			expect(() => arbiter.placeAt(hex3)).toThrow(
				/Trying to place tower at a non-empty area/i,
			)
			expect(world.getEntityAt(hex3)).toBe(tree1)
			expect(arbiter.selection).toBe(tower1)
		})

		it('Cannot capture a hex protected by tower with level 2 or lower units', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -2, -1)
			const unit1 = new Unit(2)
			const tower1 = new Tower()
			const kingdom = world.getKingdomAt(hex1)
			const opponentKingdom = world.getKingdomAt(hex2)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			world.setEntityAt(hex2, tower1)
			arbiter.setSelection(unit1)

			expect(() => arbiter.placeAt(hex2)).toThrow(
				/Trying to capture a hex but it has an equal or higher level of protection/i,
			)
			expect(world.getKingdomAt(hex2)).toBe(opponentKingdom)
			expect(world.getEntityAt(hex2)).toBe(tower1)
			expect(arbiter.selection).toBe(unit1)
		})
	})

	describe('buyTower', () => {
		it('Should put a tower in selection', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(40)
			const lastKingdomGold = kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.buyTower()

			expect(arbiter.selection).toBeInstanceOf(Tower)
			expect(kingdom.gold).toBe(lastKingdomGold - Arbiter.TOWER_PRICE)
		})

		it('Should not able to buy tower when selection is not empty', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const unit1 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)
			const lastKingdomGold = kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)

			expect(() => arbiter.buyTower()).toThrow(
				/Trying to buy tower selection is not empty/i,
			)
			expect(arbiter.selection).toBe(unit1)
			expect(kingdom.gold).toBe(lastKingdomGold)
		})

		it('Should not able to buy tower when there are not enough gold', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(10)
			const lastKingdomGold = kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)

			expect(() => arbiter.buyTower()).toThrow(
				/Trying to buy unit but not enough gold/i,
			)
			expect(arbiter.selection).toBeNull()
			expect(kingdom.gold).toBe(lastKingdomGold)
		})
	})

	describe('buyUnit', () => {
		it('Cannot buy unit if a tower is in selection', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 1, 1)
			const tower1 = new Tower()
			const kingdom = world.getKingdomAt(hex1)
			const lastKingdomGold = kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(tower1)

			expect(() => arbiter.buyUnit()).toThrow(
				/Trying to buy unit but selection has tower/i,
			)
			expect(arbiter.selection).toBe(tower1)
			expect(kingdom.gold).toBe(lastKingdomGold)
		})
	})
})
