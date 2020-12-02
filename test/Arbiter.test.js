import expect from 'expect'
import { UNIT_PRICE } from '../src/constants/variables'
import Arbiter from '../src/engine/Arbiter'
import Hex from '../src/engine/Hex'
import Unit from '../src/engine/Unit'
import Grave from '../src/engine/Grave'
import Kingdom from '../src/engine/Kingdom'
import { generateTestingWorld } from './testUtils'

describe('Arbiter', () => {
	describe('moveUnit', () => {
		it('Should be able to move unit inside kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const unit = new Unit()
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(world.getEntityAt(hex2)).toBeNull()

			arbiter.moveUnit(hex1, hex2)

			expect(world.getEntityAt(hex1)).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit)
		})

		it('Should break when trying to move a unit outside move zone', () => {
			const world = generateTestingWorld('constant-seed-5')
			const hex1 = new Hex(-2, 2, 0)
			const hex2 = new Hex(3, -3, 0)
			const unit = new Unit()
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(world.getEntityAt(hex2)).toBeNull()
			expect(() => arbiter.moveUnit(hex1, hex2)).toThrow(
				/Trying to move a unit towards outside moveZone/i,
			)
			expect(world.getEntityAt(hex1)).toBe(unit)
			expect(world.getEntityAt(hex2)).toBeNull()
		})

		it('Should break when trying to move a unit across owned kingdoms', () => {
			const world = generateTestingWorld('constant-seed-5')
			const hex1 = new Hex(-2, -2, 4)
			const hex2 = new Hex(0, -2, 2)
			const unit = new Unit()
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(world.getEntityAt(hex2)).toBeNull()
			expect(() => arbiter.moveUnit(hex1, hex2)).toThrow(
				/Trying to move a unit/i,
			)
			expect(world.getEntityAt(hex1)).toBe(unit)
			expect(world.getEntityAt(hex2)).toBeNull()
		})

		it('Should break when moving a unit owned by another player', () => {
			const world = generateTestingWorld('constant-seed-5')
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(2, -2, 0)
			const unit = new Unit()
			const arbiter = new Arbiter(world)
			const kingdom1 = world.getKingdomAt(hex1)

			world.setEntityAt(hex2, unit)
			arbiter.setCurrentPlayer(kingdom1.player)

			expect(() => arbiter.moveUnit(hex2, hex1)).toThrow(
				/Trying to move a unit/i,
			)
			expect(world.getEntityAt(hex2)).toBe(unit)
			expect(world.getEntityAt(hex1)).toBeNull()
		})

		it('Should mark a unit as "played" when upgrading a played unit', () => {
			const world = generateTestingWorld('constant-seed-5')
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const unit1 = new Unit()
			const unit2 = new Unit()
			unit2.setPlayed(true)
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getEntityAt(hex2)).toBe(unit2)
			expect(world.getEntityAt(hex2).level).toBe(2)
			expect(world.getEntityAt(hex2).played).toBe(true)
			expect(world.getEntityAt(hex1)).toBeNull()
		})

		it('Can capture a hex belong to a kingdom and mark the unit as "played"', () => {
			const world = generateTestingWorld('constant-seed-5')
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(2, -2, 0)
			const unit = new Unit()
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex1)
			const opponentKingdom = world.getKingdomAt(hex2)

			world.setEntityAt(hex1, unit)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getEntityAt(hex1)).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit)
			expect(world.getEntityAt(hex2).played).toBe(true)

			const capturedHex = world.getHexAt(hex2)
			expect(kingdom.hexs.includes(capturedHex)).toBe(true)
			expect(opponentKingdom.hexs.includes(capturedHex)).toBe(false)
			expect(capturedHex.player).toBe(kingdom.player)
			expect(capturedHex.kingdom).toBe(kingdom)
		})

		it('Cannot capture a hex that is not adjacent to kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(2, -3, 1)
			const unit = new Unit()
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(() => arbiter.moveUnit(hex1, hex2)).toThrow(
				/Trying to move a unit/i,
			)
			expect(world.getEntityAt(hex1)).toBe(unit)
			expect(world.getEntityAt(hex1).played).toBe(false)
			expect(world.getEntityAt(hex2)).toBeNull()

			const capturedHex = world.getHexAt(hex2)
			expect(kingdom.hexs.includes(capturedHex)).toBe(false)
		})

		it("Can merge a single player's hex to our kingdom when linked", () => {
			const world = generateTestingWorld('constant-seed-5')
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(2, 1, -3)
			const hex3 = new Hex(2, 2, -4)
			const unit = new Unit()
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getEntityAt(hex1)).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit)
			expect(world.getEntityAt(hex2).played).toBe(true)

			const capturedHex = world.getHexAt(hex2)
			expect(kingdom.hexs.includes(capturedHex)).toBe(true)
			expect(capturedHex.player).toBe(kingdom.player)
			expect(capturedHex.kingdom).toBe(kingdom)

			const linkedHex = world.getHexAt(hex3)
			expect(kingdom.hexs.includes(linkedHex)).toBe(true)
			expect(linkedHex.player).toBe(kingdom.player)
			expect(linkedHex.kingdom).toBe(kingdom)
		})

		it('Can merge two kingdoms to a single one, with gold combined and correct kingdom and/or player distribution', () => {
			const world = generateTestingWorld('constant-seed-5')
			const hex1 = new Hex(-2, -2, 4)
			const hex2 = new Hex(-1, -2, 3)
			const hex3 = new Hex(0, -2, 2)
			const unit = new Unit()
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex1)
			const kingdomLastGold = kingdom.gold
			const allyLastHexs = world.getKingdomAt(hex3).hexs.slice()
			const allyLastGold = world.getKingdomAt(hex3).gold

			world.setEntityAt(hex1, unit)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getEntityAt(hex2)).toBe(unit)
			expect(kingdom.gold).toBe(kingdomLastGold + allyLastGold)
			allyLastHexs.forEach((allyHex) => {
				expect(allyHex.player).toBe(kingdom.player)
				expect(allyHex.kingdom).toBe(kingdom)
			})
		})

		it("Cannot capture a hex protected by opponent's same level unit (And not levle 4)", () => {
			const world = generateTestingWorld('constant-seed-5')
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(2, -2, 0)
			const unit1 = new Unit()
			const unit2 = new Unit()
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex1)
			const opponentKingdom = world.getKingdomAt(hex2)

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(() => arbiter.moveUnit(hex1, hex2)).toThrow(
				/Trying to move a unit/i,
			)
			expect(world.getEntityAt(hex1)).toBe(unit1)
			expect(world.getEntityAt(hex2)).toBe(unit2)

			const capturedHex = world.getHexAt(hex2)
			expect(kingdom.hexs.includes(capturedHex)).toBe(false)
			expect(opponentKingdom.hexs.includes(capturedHex)).toBe(true)
			expect(capturedHex.player).toBe(opponentKingdom.player)
			expect(capturedHex.kingdom).toBe(opponentKingdom)
		})

		it('Cannot capture a hex protected by opponent higher level entity', () => {
			const world = generateTestingWorld('constant-seed-5')
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(2, -2, 0)
			const unit1 = new Unit()
			const unit2 = new Unit(2)
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex1)
			const opponentKingdom = world.getKingdomAt(hex2)

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(() => arbiter.moveUnit(hex1, hex2)).toThrow(
				/Trying to move a unit/i,
			)
			expect(world.getEntityAt(hex1)).toBe(unit1)
			expect(world.getEntityAt(hex2)).toBe(unit2)

			const capturedHex = world.getHexAt(hex2)
			expect(kingdom.hexs.includes(capturedHex)).toBe(false)
			expect(opponentKingdom.hexs.includes(capturedHex)).toBe(true)
			expect(capturedHex.player).toBe(opponentKingdom.player)
			expect(capturedHex.kingdom).toBe(opponentKingdom)
		})

		it('Can capture a hex protected by opponent level 4 with a level 4 unit', () => {
			const world = generateTestingWorld('constant-seed-5')
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(2, -2, 0)
			const unit1 = new Unit(4)
			const unit2 = new Unit(4)
			const arbiter = new Arbiter(world)
			const kingdom = world.getKingdomAt(hex1)
			const opponentKingdom = world.getKingdomAt(hex2)

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getEntityAt(hex1)).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)

			const capturedHex = world.getHexAt(hex2)
			expect(kingdom.hexs.includes(capturedHex)).toBe(true)
			expect(opponentKingdom.hexs.includes(capturedHex)).toBe(false)
			expect(capturedHex.player).toBe(kingdom.player)
			expect(capturedHex.kingdom).toBe(kingdom)
		})

		it('Can split opponent kingdom in two little kingdoms when separated', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(0, -2, 2)
			const hex2 = new Hex(0, -1, 1)
			const subKingdomHex1 = new Hex(1, -1, 0)
			const subKingdomHex2 = new Hex(-2, 1, 1)
			const unit1 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getHexAt(hex2).kingdom).toBe(kingdom)
			expect(world.getKingdomAt(subKingdomHex1)).toBeInstanceOf(Kingdom)
			expect(world.getKingdomAt(subKingdomHex2)).toBeInstanceOf(Kingdom)
			expect(world.getKingdomAt(subKingdomHex2)).not.toBe(
				world.getKingdomAt(subKingdomHex1),
			)
		})

		it('Split opponent kingdom in two single hexs and kill main kingdom if kingdom has only 3 hexs', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-3, 1, 2)
			const hex2 = new Hex(-4, 2, 2)
			const subKingdomHex1 = new Hex(-4, 1, 3)
			const subKingdomHex2 = new Hex(-4, 3, 1)
			const unit1 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)
			const opponentKingdom = world.getKingdomAt(hex2)

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.kingdoms.includes(opponentKingdom)).toBe(false)
			expect(world.getHexAt(subKingdomHex1).kingdom).toBeNull()
			expect(world.getHexAt(subKingdomHex2).kingdom).toBeNull()
		})

		it('Marks a unit as "played" even if it only moves into empty hex inside kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-1, 0, 1)
			const hex2 = new Hex(2, -2, 0)
			const unit1 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getEntityAt(hex1)).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex2).played).toBe(true)
		})
	})

	describe('buyUnitTowardsHex', () => {
		it('Should decrease kingdom gold and spawns unit in the hex, the gold decreased must be equal to `level * pricePerLevel`', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 0, 2)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(40)
			const previousGold = kingdom.gold
			const buyLevel = 3

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.buyUnitTowardsHex(hex1, kingdom, buyLevel)

			expect(kingdom.gold).toBe(previousGold - UNIT_PRICE * buyLevel)
			expect(world.getEntityAt(hex1)).toBeInstanceOf(Unit)
			expect(world.getEntityAt(hex1).level).toBe(3)
			expect(world.getEntityAt(hex1).played).toBe(false)
		})

		it('Should upgrade unit if hex is reserved by one (below level 4)', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 0, 2)
			const unit1 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(40)
			const previousKingdomGold = kingdom.gold
			const previousUnitLevel = unit1.level
			const buyLevel = 3

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.buyUnitTowardsHex(hex1, kingdom, 3)

			expect(kingdom.gold).toBe(previousKingdomGold - UNIT_PRICE * buyLevel)
			expect(world.getEntityAt(hex1).level).toBe(previousUnitLevel + buyLevel)
		})

		it('Can buy a unit to capture adjacent hexs', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 0, 2)
			const hex2 = new Hex(-2, -1, 3)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(40)
			const opponentKingdom = world.getKingdomAt(hex2)
			const previousGold = kingdom.gold
			const buyLevel = 3

			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.buyUnitTowardsHex(hex2, kingdom, buyLevel)

			expect(kingdom.gold).toBe(previousGold - UNIT_PRICE * buyLevel)
			expect(world.getEntityAt(hex2)).toBeInstanceOf(Unit)
			expect(world.getEntityAt(hex2).level).toBe(3)
			expect(world.getEntityAt(hex2).played).toBe(true)

			expect(kingdom.hexs.includes(world.getHexAt(hex2))).toBe(true)
			expect(opponentKingdom.hexs.includes(world.getHexAt(hex2))).toBe(false)
			expect(world.kingdoms.includes(opponentKingdom)).toBe(false)
			expect(world.getHexAt(hex2).player).toBe(kingdom.player)
			expect(world.getHexAt(hex2).kingdom).toBe(kingdom)
		})

		it('Should throw an error when not enough money', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 0, 2)
			const kingdom = world.getKingdomAt(hex1)
			const buyLevel = 2

			arbiter.setCurrentPlayer(kingdom.player)
			kingdom.setGold(15)

			expect(() => arbiter.buyUnitTowardsHex(hex1, kingdom, buyLevel)).toThrow(
				/Trying to buy unit but not enough gold/i,
			)
			expect(kingdom.gold).toBe(15)
			expect(world.getEntityAt(hex1)).toBeNull()
		})

		it('Throw error when unit level is exceeding the allowed max level', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 0, 2)
			const unit1 = new Unit(4)
			const kingdom = world.getKingdomAt(hex1)
			kingdom.setGold(40)

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)

			expect(() => arbiter.buyUnitTowardsHex(hex1, kingdom, 1)).toThrow(
				/Trying to merge two units but they exceeds the maximum level possible/i,
			)
			expect(world.getEntityAt(hex1).level).toBe(4)
			expect(kingdom.gold).toBe(40)
		})
	})

	describe('endTurn', () => {
		it('Should reset units moved', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const unit1 = new Unit(1)
			unit1.setPlayed(true)
			const unit2 = new Unit(1)
			unit2.setPlayed(true)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)

			for (let i = 0; i < 6; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getEntityAt(hex1).played).toBe(false)
			expect(world.getEntityAt(hex2).played).toBe(false)
		})

		it('Kills units if not enough money to pay them', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const unit1 = new Unit(4)
			const unit2 = new Unit(4)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)

			for (let i = 0; i < 6; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getHexAt(hex1).entity).toBeInstanceOf(Grave)
			expect(world.getHexAt(hex2).entity).toBeInstanceOf(Grave)
		})

		it('Keeps a trace of kingdom economy', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const unit1 = new Unit(1)
			const unit2 = new Unit(2)
			const unit1cost = unit1.getUnitMaintenanceCost()
			const unit2cost = unit2.getUnitMaintenanceCost()
			const kingdom = world.getKingdomAt(hex1)
			let lastKingdomGold = kingdom.gold

			arbiter.setCurrentPlayer(kingdom.player)
			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)

			for (let i = 0; i < 6; i += 1) {
				arbiter.endTurn()
			}

			expect(kingdom.gold).toBe(
				lastKingdomGold + kingdom.getIncome() - kingdom.getOutcome(),
			)
			expect(kingdom.getIncome()).toBe(5)
			expect(kingdom.getOutcome()).toBe(unit1cost + unit2cost)

			lastKingdomGold = kingdom.gold
			for (let i = 0; i < 6; i += 1) {
				arbiter.endTurn()
			}

			expect(kingdom.gold).toBe(
				lastKingdomGold + kingdom.getIncome() - kingdom.getOutcome(),
			)
			expect(kingdom.getIncome()).toBe(5)
			expect(kingdom.getOutcome()).toBe(unit1cost + unit2cost)
		})

		it('keeps a trace of kingdom economy when units die', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const unit1 = new Unit(4)
			const unit2 = new Unit(4)
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, unit2)

			expect(kingdom.getIncome()).toBe(5)
			expect(kingdom.getOutcome()).toBe(
				unit1.getUnitMaintenanceCost() + unit2.getUnitMaintenanceCost(),
			)

			for (let i = 0; i < 6; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getEntityAt(hex1)).toBeInstanceOf(Grave)
			expect(world.getEntityAt(hex2)).toBeInstanceOf(Grave)
			expect(kingdom.gold).toBe(0)
			expect(kingdom.getIncome()).toBe(3)
			expect(kingdom.getOutcome()).toBe(0)
		})
	})
})
