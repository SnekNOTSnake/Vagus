import expect from 'expect'
import HexUtils from '../src/engine/HexUtils'
import { generateTestingWorld } from './testUtils'
import Hex from '../src/engine/Hex'

const getMiddleHex = (world, kingdom) => {
	return HexUtils.getMostInteriorHexs(world, kingdom)[0]
}

describe('Hexutils', () => {
	describe('getMostInteriorHexs', () => {
		it('Should return the middle hex of a thin kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')

			const kingdom = world.getKingdomAt(new Hex(0, -1, 1))
			const middleHex = getMiddleHex(world, kingdom)

			expect(middleHex.isSameAs(new Hex(-2, 1, 1))).toBe(true)
		})

		it('Should return the middle hex of a small round kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')

			const kingdom = world.getKingdomAt(new Hex(3, -1, -2))
			const middleHex = getMiddleHex(world, kingdom)

			expect(middleHex.isSameAs(new Hex(2, 0, -2))).toBe(true)
		})

		it('Should return any hex of a 2-hex kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')

			const kingdom = world.getKingdomAt(new Hex(0, 3, -3))
			const middleHex = getMiddleHex(world, kingdom)

			expect(
				middleHex.isSameAs(new Hex(0, 3, -3)) ||
					middleHex.isSameAs(new Hex(1, 3, -4)),
			).toBe(true)
		})

		it('Should return any hex of a 3-hex triangle kingdom', () => {
			const world = generateTestingWorld('constant-seed-5')

			const kingdom = world.getKingdomAt(new Hex(0, 2, -2))
			const middleHex = getMiddleHex(world, kingdom)

			expect(
				middleHex.isSameAs(new Hex(0, 2, -2)) ||
					middleHex.isSameAs(new Hex(0, 1, -1)) ||
					middleHex.isSameAs(new Hex(1, 1, -2)),
			).toBe(true)
		})
	})
})
