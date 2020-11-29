import expect from 'expect'
import Arbiter from '../src/engine/Arbiter'
import Hex from '../src/engine/Hex'
import Unit from '../src/engine/Unit'
import Tree from '../src/engine/Tree'
import Grave from '../src/engine/Grave'
import { generateTestingWorld } from './testUtils'

describe('ArbiterTree', () => {
	describe('moveUnit', () => {
		it('Makes a unit played its turn after clearing a tree', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(1, 0, -1)
			const hex2 = new Hex(2, -1, -1)
			const unit1 = new Unit(1)
			const tree1 = new Tree()
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex2, tree1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getEntityAt(hex1)).toBeNull()
			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex2).played).toBe(true)
		})

		it('Transforms capital to a tree on a 2-hex kingdom if the capital is the only hex', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 2, 0)
			const hex2 = new Hex(-2, 3, -1)
			const hex3 = new Hex(-1, 2, -1)
			const unit1 = new Unit(2)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit1)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex3)).toBeInstanceOf(Tree)
			expect(world.getKingdomAt(hex3)).toBeNull()
		})

		it('Transforms unit to a tree on a 2-hex kingdom if the unit is the only hex', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(-2, 4, -2)
			const hex2 = new Hex(-1, 2, -1)
			const hex3 = new Hex(-2, 3, -1)
			const unit1 = new Unit(2)
			const unit2 = new Unit(1)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, unit1)
			world.setEntityAt(hex3, unit2)
			arbiter.setCurrentPlayer(kingdom.player)
			arbiter.moveUnit(hex1, hex2)

			expect(world.getEntityAt(hex2)).toBe(unit1)
			expect(world.getEntityAt(hex3)).toBeInstanceOf(Tree)
			expect(world.getKingdomAt(hex3)).toBeNull()
		})
	})

	describe('endTurn', () => {
		it("Transforms graves to trees on owner's turn", () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const grave1 = new Grave()
			const grave2 = new Grave()
			const kingdom = world.getKingdomAt(hex1)

			arbiter.setCurrentPlayer(kingdom.player)
			world.setEntityAt(hex1, grave1)
			world.setEntityAt(hex2, grave2)

			arbiter.endTurn()

			expect(world.getEntityAt(hex1)).toBe(grave1)
			expect(world.getEntityAt(hex2)).toBe(grave2)

			for (let i = 0; i < 5; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getEntityAt(hex1)).toBeInstanceOf(Tree)
			expect(world.getEntityAt(hex2)).toBeInstanceOf(Tree)
		})

		it('Spawns continental tree with time', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(2, -1, -1)
			const hex2 = new Hex(3, -1, -2)
			const tree1 = new Tree(Tree.CONTINENTAL)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, tree1)
			arbiter.setCurrentPlayer(kingdom.player)

			for (let i = 0; i < 80; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getEntityAt(hex1)).toBeInstanceOf(Tree)
			expect(world.getEntityAt(hex1).type).toBe(Tree.CONTINENTAL)
			expect(world.getEntityAt(hex2)).toBeInstanceOf(Tree)
			expect(world.getEntityAt(hex2).type).toBe(Tree.CONTINENTAL)
		})

		it('Spawns coastal tree with time', () => {
			const world = generateTestingWorld('constant-seed-5')
			const arbiter = new Arbiter(world)
			const hex1 = new Hex(3, -4, 1)
			const hex2 = new Hex(4, -4, 0)
			const tree1 = new Tree(Tree.COASTAL)
			const kingdom = world.getKingdomAt(hex1)

			world.setEntityAt(hex1, tree1)
			arbiter.setCurrentPlayer(kingdom.player)

			for (let i = 0; i < 80; i += 1) {
				arbiter.endTurn()
			}

			expect(world.getEntityAt(hex1)).toBeInstanceOf(Tree)
			expect(world.getEntityAt(hex1).type).toBe(Tree.COASTAL)
			expect(world.getEntityAt(hex2)).toBeInstanceOf(Tree)
			expect(world.getEntityAt(hex2).type).toBe(Tree.COASTAL)
		})
	})
})
