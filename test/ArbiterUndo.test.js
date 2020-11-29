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
			kingdom.setGold(40)
			const kingdomLastGold = kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.buyUnitTowardsHex(hex1, kingdom)
			arbiter.undo()

			expect(kingdom.gold).toBe(kingdomLastGold)
			expect(world.getEntityAt(hex1)).toBeNull()
		})

		it('Can undo unit buy/upgrade', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const unit1 = new Unit()
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(40)
			const unitLastLevel = unit1.level
			const kingdomLastGold = kingdom.gold

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.buyUnitTowardsHex(hex1, kingdom)
			arbiter.undo()

			expect(world.getEntityAt(hex1).level).toBe(unitLastLevel)
			expect(kingdom.gold).toBe(kingdomLastGold)
		})

		it('Can undo moveUnit when moving unit inside own kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const unit1 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)
			arbiter.undo()

			expect(world.getEntityAt(hex1)).toBe(unit1)
			expect(world.getEntityAt(hex1).played).toBe(false)
			expect(world.getEntityAt(hex2)).toBeNull()
		})

		it('Can undo moveUnit and restore hex kingdom when player captures a hex of a 2-hex kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(0, 1, -1)
			const hex2 = new Hex(-1, 2, -1)
			const hex3 = new Hex(-2, 3, -1)
			const unit1 = new Unit(2)
			const kingdom1 = world.getKingdomAt(hex1)
			const kingdom2 = world.getKingdomAt(hex2)
			const kingdom2LastHexs = kingdom2.hexs.slice()

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom1.player)
			arbiter.moveUnit(hex1, hex2)
			arbiter.undo()

			expect(world.getKingdomAt(hex2)).toBe(kingdom2)
			expect(
				world.getKingdomAt(hex2).hexs.every((hex) => {
					return kingdom2LastHexs.includes(hex)
				}),
			).toBe(true)
			expect(world.kingdoms.includes(kingdom2)).toBe(true)

			expect(world.getKingdomAt(hex3)).toBe(kingdom2)
			expect(
				world.getKingdomAt(hex3).hexs.every((hex) => {
					return kingdom2LastHexs.includes(hex)
				}),
			).toBe(true)
			expect(world.getEntityAt(hex1)).toBe(unit1)

			expect(
				world
					.getKingdomAt(hex2)
					.hexs.some((hex) => hex.entity instanceof Capital),
			).toBe(true)
		})

		it('Can undo moveUnit and restore the tree the unit has cut on its own kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(1, 0, -1)
			const hex2 = new Hex(2, -1, -1)
			const unit1 = new Unit(2)
			const tree1 = new Tree()
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex2, tree1)
			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)
			arbiter.undo()

			expect(world.getEntityAt(hex1)).toBe(unit1)
			expect(world.getEntityAt(hex2)).toBe(tree1)
		})

		it('Can undo moveUnit and restore the dead unit the unit has replaced', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(2, -2, 0)
			const unit1 = new Unit(2)
			const unit2 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)
			arbiter.undo()

			expect(world.getEntityAt(hex1)).toBe(unit1)
			expect(world.getEntityAt(hex2)).toBe(unit2)
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
			const opponentKingdomLastHexs = opponentKingdom.hexs.slice()

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)
			arbiter.undo()

			expect(world.getKingdomAt(hex2)).toBe(opponentKingdom)
			expect(
				world.getKingdomAt(hex2).hexs.every((hex) => {
					return opponentKingdomLastHexs.includes(hex)
				}),
			).toBe(true)
			expect(world.getKingdomAt(hex3)).toBe(opponentKingdom)
			expect(
				world.getKingdomAt(hex3).hexs.every((hex) => {
					return opponentKingdomLastHexs.includes(hex)
				}),
			).toBe(true)
			expect(world.getEntityAt(hex1)).toBe(unit1)
			expect(kingdom.hexs.includes(hex2)).toBe(false)

			const capturedHex = world.getHexAt(hex2)
			expect(capturedHex.player).toBe(opponentKingdom.player)
			expect(capturedHex.kingdom).toBe(opponentKingdom)
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
			const lastOpponentHexPlayer = world.getHexAt(hex2).player
			const allyKingdom = world.getKingdomAt(hex3)
			const lastAllyKingdomGold = allyKingdom.gold
			const lastAllyKingdomHexs = allyKingdom.hexs.slice()

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)
			arbiter.undo()

			expect(world.getKingdomAt(hex2)).toBe(opponentKingdom)

			expect(world.getKingdomAt(hex3)).toBe(allyKingdom)
			expect(
				world.getKingdomAt(hex3).hexs.every((hex) => {
					return lastAllyKingdomHexs.includes(hex)
				}),
			).toBe(true)
			expect(world.getKingdomAt(hex4)).toBe(allyKingdom)
			expect(
				world.getKingdomAt(hex4).hexs.every((hex) => {
					return lastAllyKingdomHexs.includes(hex)
				}),
			).toBe(true)

			expect(world.kingdoms.includes(allyKingdom)).toBe(true)
			expect(kingdom.hexs.includes(world.getHexAt(hex3))).toBe(false)
			expect(kingdom.hexs.includes(world.getHexAt(hex4))).toBe(false)
			expect(allyKingdom.gold).toBe(lastAllyKingdomGold)
			expect(kingdom.gold).toBe(lastKingdomGold)

			const capturedHex = world.getHexAt(hex2)
			expect(capturedHex.player).toBe(lastOpponentHexPlayer)
			expect(capturedHex.kingdom).toBeNull()
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

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.buyUnitTowardsHex(hex1, kingdom)
			arbiter.buyUnitTowardsHex(hex1, kingdom)
			arbiter.undoAll()

			expect(world.getEntityAt(hex1).level).toBe(lastUnit1Level)
			expect(kingdom.gold).toBe(lastKingdomGold)
		})
	})
})
