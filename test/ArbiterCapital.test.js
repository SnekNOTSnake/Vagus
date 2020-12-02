import expect from 'expect'
import Arbiter from '../src/engine/Arbiter'
import Hex from '../src/engine/Hex'
import Unit from '../src/engine/Unit'
import { generateTestingWorld } from './testUtils'

describe('ArbiterCapital', () => {
	describe('moveUnit', () => {
		it('Cannot move a unit on owned capital', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(2, 0, -2)
			const unit1 = new Unit(1)
			const capital1 = world.getEntityAt(hex2)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(() => arbiter.moveUnit(hex1, hex2)).toThrow(
				/Trying to move a unit/i,
			)
			expect(world.getEntityAt(hex1)).toBe(unit1)
			expect(world.getEntityAt(hex2)).toBe(capital1)
		})

		it('Cannot capture an enemy capital with a level 1 unit', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 2, 0)
			const hex2 = new Hex(-1, 2, -1)
			const unit1 = new Unit(1)
			const capital1 = world.getEntityAt(hex2)
			const kingdom = world.getKingdomAt(hex1)
			const hex2LastKingdom = world.getKingdomAt(hex2)

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(() => arbiter.moveUnit(hex1, hex2)).toThrow(
				/Trying to move a unit/i,
			)
			expect(world.getEntityAt(hex2)).toBe(capital1)
			expect(world.getKingdomAt(hex2)).toBe(hex2LastKingdom)
			expect(world.getEntityAt(hex1)).toBe(unit1)
		})

		it('Can capture an enemy capital with a level 2 unit and rebuilt capital with 0 money', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(0, 1, -1)
			const hex2 = new Hex(2, 0, -2)
			const unit1 = new Unit(2)
			const kingdom1 = world.getKingdomAt(hex1)
			const kingdom2 = world.getKingdomAt(hex2)

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom1.player)
			arbiter.moveUnit(hex1, hex2)

			expect(kingdom2.gold).toBe(0)
			expect(world.getEntityAt(hex1)).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getHexAt(hex2).kingdom).toBe(kingdom1)
		})

		it('Does not rebuild capital if 2-hex kingdom lost a hex and now has only one', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 2, 0)
			const hex2 = new Hex(-1, 2, -1)
			const hex3 = new Hex(-2, 3, -1)
			const unit1 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)
			const lastCapturedKingdom = hex2.kingdom

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getEntityAt(hex1)).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getHexAt(hex2).kingdom).toBe(kingdom)
			expect(world.getHexAt(hex3).kingdom).toBeNull()
			expect(world.kingdoms.includes(lastCapturedKingdom)).toBe(false)
		})

		it('Removes the capital of the weakest kingdom when merged to a stronger one', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, -2, 4)
			const hex2 = new Hex(-1, -2, 3)
			const hex3 = new Hex(1, -2, 1)
			const unit1 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)
			const lastHex1Capital = world.getEntityAt(hex1)

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getKingdomAt(hex2)).toBe(kingdom)
			expect(world.getKingdomAt(hex3)).toBe(kingdom)
			expect(world.getEntityAt(hex3)).toBe(null)
			expect(world.getEntityAt(hex1)).toBe(lastHex1Capital)
		})

		it('Replaces capital even if all over hexs have an entity', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(1, 1, -2)
			const hex2 = new Hex(2, 0, -2)
			const unit1 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)
			const opponentKingdom = world.getKingdomAt(hex2)

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(new Hex(1, 0, -1), new Unit(1))
			world.setEntityAt(new Hex(2, -1, -1), new Unit(1))
			world.setEntityAt(new Hex(3, -1, -2), new Unit(1))
			world.setEntityAt(new Hex(3, 0, -3), new Unit(1))
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(opponentKingdom.hexs.includes(world.getHexAt(hex2))).toBe(false)
			expect(opponentKingdom.hexs.some((hex) => hex.hasCapital())).toBe(true)
		})
	})

	describe('buyTowerForHex', () => {
		it('Cannot buy a tower targeting hex reserved by a capital', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, 0, -2)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(40)
			const lastHex1Capital = world.getEntityAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)

			expect(() => arbiter.buyTowerForHex(hex1)).toThrow(
				/Trying to spawn tower at a non-empty area/i,
			)
			expect(world.getEntityAt(hex1)).toBe(lastHex1Capital)
		})
	})
})
