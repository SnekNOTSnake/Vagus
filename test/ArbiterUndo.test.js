import expect from 'expect'
import Arbiter from '../src/engine/Arbiter'
import Capital from '../src/engine/Capital'
import Hex from '../src/engine/Hex'
import Unit from '../src/engine/Unit'
import Tree from '../src/engine/Tree'
import { generateTestingWorld } from './testUtils'

describe('ArbiterUndo', () => {
	describe('undo', () => {
		it('Can undo unit buy', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const kingdom = world.getKingdomAt(hex1)
			const kingdomLastGold = kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.buyUnit()
			arbiter.undo()

			expect(kingdom.gold).toBe(kingdomLastGold)
			expect(arbiter.selection).toBeNull()
		})

		it('Can undo unit buy/upgrade', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const unit1 = new Unit()
			const kingdom = world.getKingdomAt(hex1)
			const unitLastLevel = unit1.level
			const kingdomLastGold = kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.buyUnit()
			arbiter.undo()

			expect(arbiter.selection.level).toBe(unitLastLevel)
			expect(kingdom.gold).toBe(kingdomLastGold)
		})

		it('Can undo takeUnit', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const unit1 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			world.setEntityAt(hex1, unit1)
			arbiter.takeUnitAt(hex1)
			arbiter.undo()

			expect(arbiter.selection).toBeNull()
			expect(world.getEntityAt(hex1)).toBe(unit1)
		})

		it('Can undo placeAt when placed in own kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const unit1 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex1)
			arbiter.undo()

			expect(arbiter.selection).toBe(unit1)
			expect(arbiter.selection.played).toBe(false)
			expect(world.getEntityAt(hex1)).toBeNull()
		})

		it('Can undo placeAt and restore hex kingdom when I captured a hex of a 2-hex kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(0, 1, -1)
			const hex2 = new Hex(-1, 2, -1)
			const hex3 = new Hex(-2, 3, -1)
			const unit1 = new Unit(2)
			const kingdom1 = world.getKingdomAt(hex1)
			const kingdom2 = world.getKingdomAt(hex2)

			arbiter.setCurrentPlayer(kingdom1.player)
			arbiter.setCurrentKingdom(kingdom1)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)
			arbiter.undo()

			expect(world.getHexAt(hex2).kingdom).toBe(kingdom2)
			expect(world.getHexAt(hex2).entity).toBeInstanceOf(Capital)
			expect(world.getHexAt(hex3).kingdom).toBe(kingdom2)
			expect(world.kingdoms.includes(kingdom2)).toBe(true)
			expect(arbiter.selection).toBe(unit1)
		})

		it('Can undo placeAt and restore the tree the unit has cut on its own kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const unit1 = new Unit(2)
			const tree1 = new Tree()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			world.setEntityAt(hex1, tree1)
			arbiter.placeAt(hex1)
			arbiter.undo()

			expect(world.getEntityAt(hex1)).toBe(tree1)
			expect(arbiter.selection).toBe(unit1)
		})

		it('Can undo placeAt and restore the died the unit has replaced', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const unit1 = new Unit(2)
			const unit2 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			world.setEntityAt(hex1, unit2)
			arbiter.placeAt(hex1)
			arbiter.undo()

			expect(world.getEntityAt(hex1)).toBe(unit2)
			expect(arbiter.selection).toBe(unit1)
		})

		it('Can undo kingdom got split into smaller kingdom and single hex', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(1, -1, 0)
			const hex3 = new Hex(2, -2, 0)
			const unit1 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)
			const opponentKingdom = world.getKingdomAt(hex2)

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)
			arbiter.undo()

			expect(world.getKingdomAt(hex2)).toBe(opponentKingdom)
			expect(world.getKingdomAt(hex3)).toBe(opponentKingdom)
			expect(arbiter.selection).toBe(unit1)
			expect(kingdom.hexs.includes(hex2)).toBe(false)
		})

		it('Can undo kingoms got merged', () => {
			const world = generateTestingWorld('constant-seed-2')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const hex2 = new Hex(2, -1, -1)
			const hex3 = new Hex(3, -1, -2)
			const hex4 = new Hex(4, -2, -2)
			const unit1 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)
			const lastKingdomGold = kingdom.gold
			const opponentKingdom = world.getKingdomAt(hex2)
			const allyKingdom = world.getKingdomAt(hex3)
			const lastAllyKingdomGold = allyKingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.placeAt(hex2)
			arbiter.undo()

			expect(world.getKingdomAt(hex2)).toBe(opponentKingdom)
			expect(world.getKingdomAt(hex3)).toBe(allyKingdom)
			expect(world.getKingdomAt(hex4)).toBe(allyKingdom)
			expect(world.kingdoms.includes(allyKingdom)).toBe(true)
			expect(
				kingdom.hexs.includes(world.getHexAt(hex3)) ||
					kingdom.hexs.includes(world.getHexAt(hex4)),
			).toBe(false)
			expect(allyKingdom.gold).toBe(lastAllyKingdomGold)
			expect(kingdom.gold).toBe(lastKingdomGold)
		})
	})

	describe('undoAll', () => {
		it('Should undo all bought units', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -2, 0)
			const unit1 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(40)
			const lastKingdomGold = kingdom.gold
			const lastUnit1Level = unit1.level

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.setCurrentKingdom(kingdom)
			arbiter.setSelection(unit1)
			arbiter.buyUnit()
			arbiter.buyUnit()
			arbiter.undoAll()

			expect(arbiter.selection.level).toBe(lastUnit1Level)
			expect(kingdom.gold).toBe(lastKingdomGold)
		})
	})
})
