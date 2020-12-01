import expect from 'expect'
import { TOWER_PRICE } from '../src/constants/variables'
import Arbiter from '../src/engine/Arbiter'
import Hex from '../src/engine/Hex'
import Unit from '../src/engine/Unit'
import Tree from '../src/engine/Tree'
import Tower from '../src/engine/Tower'
import { generateTestingWorld } from './testUtils'

describe('ArbiterTower', () => {
	describe('moveUnit', () => {
		it('Cannot move a unit to a tower', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(1, 0, -1)
			const hex2 = new Hex(2, -1, -1)
			const unit1 = new Unit(1)
			const tower1 = new Tower()
			const kingdom = world.getKingdomAt(hex2)

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, tower1)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(() => arbiter.moveUnit(hex1, hex2)).toThrow(
				/Trying to place unit in a hex reserved by a tower or capital/i,
			)
			expect(world.getEntityAt(hex2)).toBe(tower1)
			expect(world.getEntityAt(hex1)).toBe(unit1)
		})

		it('Cannot capture a hex protected by tower with level 2 or lower units', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(2, -2, 0)
			const unit1 = new Unit(2)
			const tower1 = new Tower()
			const kingdom = world.getKingdomAt(hex1)
			const opponentKingdom = world.getKingdomAt(hex2)

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, tower1)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(() => arbiter.moveUnit(hex1, hex2)).toThrow(
				/Trying to capture a hex but it has an equal or higher level of protection/i,
			)
			expect(world.getEntityAt(hex1)).toBe(unit1)
			expect(world.getKingdomAt(hex2)).toBe(opponentKingdom)
			expect(world.getEntityAt(hex2)).toBe(tower1)
		})
	})

	describe('buyTowerForHex', () => {
		it('Should decreases gold and spawns tower', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(40)
			const lastKingdomGold = kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.buyTowerForHex(hex1)

			expect(world.getEntityAt(hex1)).toBeInstanceOf(Tower)
			expect(kingdom.gold).toBe(lastKingdomGold - TOWER_PRICE)
		})

		it('Cannot buy tower targeting enemy hex or non-empty hex', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(1, -1, 0)
			const hex3 = new Hex(3, -1, -2)
			const tree1 = new Tree()
			const kingdom = world.getKingdomAt(hex1)

			world.getKingdomAt(hex1).setGold(40)
			world.getKingdomAt(hex2).setGold(40)
			world.setEntityAt(hex3, tree1)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(() => arbiter.buyTowerForHex(hex2)).toThrow(
				/Trying to buy tower but hex target is not belong to current player/i,
			)
			expect(world.getEntityAt(hex2)).toBeNull()

			expect(() => arbiter.buyTowerForHex(hex3)).toThrow(
				/Trying to spawn tower at a non-empty area/i,
			)
			expect(world.getEntityAt(hex3)).toBe(tree1)
		})

		it('Should not able to buy tower when there are not enough gold', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(10)
			const lastKingdomGold = kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)

			expect(() => arbiter.buyTowerForHex(hex1)).toThrow(
				/Trying to buy unit but not enough gold/i,
			)
			expect(world.getEntityAt(hex1)).toBeNull()
			expect(kingdom.gold).toBe(lastKingdomGold)
		})
	})
})
