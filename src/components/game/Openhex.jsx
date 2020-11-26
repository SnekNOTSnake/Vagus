import React from 'react'
import PropTypes from 'prop-types'
import { HexGrid, Layout } from 'react-hexgrid'
import HexUtils from '../../engine/HexUtils'
import Arbiter from '../../engine/Arbiter'
import HexCell from './HexCell'
import KingdomDefense from './KingdomDefense'

/**
 * @typedef {import('../../engine/Hex.js').default} Hex
 * @typedef {import('../../engine/HexUtils.js').default} HexUtils
 * @typedef {import('../../engine/Arbiter.js').default} Arbiter
 */

const HEX_SIZE = 20
const HEX_PADDING = 10

/**
 * Get the viewBox for the entire Hexgrid.
 * It works by getting the smallest hex coords and the higest hex coords.
 *
 * @param {Hex[]} hexs
 * @param {Layout} layout
 * @param {Number} padding
 *
 * @returns {[Number, Number, Number, Number]} First two are coords,
 * 																						 Last two are viewBox size
 */
const createViewBox = (hexs, layout, padding) => {
	const initPixel = HexUtils.hexToPixel(hexs[0], layout)
	const coords = [initPixel.x, initPixel.y, initPixel.x, initPixel.y]

	hexs.forEach((hex) => {
		const hexCoords = HexUtils.hexToPixel(hex, layout)

		coords[0] = Math.min(hexCoords.x, coords[0])
		coords[1] = Math.min(hexCoords.y, coords[1])
		coords[2] = Math.max(hexCoords.x, coords[2])
		coords[3] = Math.max(hexCoords.y, coords[3])
	})

	coords[0] -= layout.size.x
	coords[1] -= layout.size.y

	// viewBox size, find the biggest place (coords in px) of the hex
	coords[2] += layout.size.x
	coords[3] += layout.size.y

	const viewBox = [
		coords[0],
		coords[1],

		/*
		 The reason why the highest hex coords is getting substracted
		 by the *initialCoords* is because
		 - If we don't substract it, it'll just be a regular coords, not `size`
		 - initalCoords are always less than or equal 0, making it an addition
		 - so, (200 - -100) + (10 * 2) = 320 viewBox size
		*/
		coords[2] - coords[0] + padding * 2,
		coords[3] - coords[1] + padding * 2,
	]

	return viewBox
}

const layout = new Layout()
layout.size = { x: HEX_SIZE, y: HEX_SIZE }
layout.spacing = 0.99
layout.origin = { x: 0, y: 0 }
layout.orientation = Layout.LAYOUT_FLAT

/**
 * @param {{ arbiter: Arbiter }} props
 */
const Openhex = (props) => {
	const { arbiter, width, height, onUpdate, onHexClick, onArbiterError } = props

	const [, update] = React.useState(null)
	const [showKingdomDefense, setShowKingdomDefense] = React.useState(null)

	const handleHexClick = (hex) => {
		if (
			(hex.hasTower() || hex.hasCapital()) &&
			hex.kingdom === arbiter.currentKingdom
		)
			setShowKingdomDefense(hex.kingdom)

		onHexClick()
		try {
			arbiter.smartAction(hex)
			update({})
			onUpdate()
		} catch (err) {
			onArbiterError(err)
		}
	}

	const viewBox = createViewBox(arbiter.world.hexs, layout, HEX_PADDING)

	return (
		<HexGrid width={width} height={height} viewBox={viewBox.join(' ')}>
			<Layout
				size={layout.size}
				spacing={layout.spacing}
				origin={layout.origin}
				flat={layout.orientation === Layout.LAYOUT_FLAT}
			>
				<g
					className="all-hexs-shadow"
					strokeLinecap="round"
					strokeWidth="6"
					stroke="#151515"
					transform={
						// Transform to make the hexs view more center
						`translate(${HEX_PADDING + 2} ${HEX_PADDING + 3})`
					}
				>
					{arbiter.world.hexs.map((hex) => (
						<g key={hex.hash}>
							<HexCell empty hex={hex} />
						</g>
					))}
				</g>
				<g
					className="all-hexs"
					transform={
						// Transform to make the hexs view more center
						`translate(${HEX_PADDING} ${HEX_PADDING})`
					}
				>
					{arbiter.world.hexs.map((hex) => (
						<g key={hex.hash}>
							<HexCell
								clickable={
									hex.player === arbiter.currentPlayer &&
									hex.kingdom !== null &&
									hex.kingdom !== arbiter.currentKingdom
								}
								movable={
									hex.player === arbiter.currentPlayer &&
									hex?.entity?.played === false
								}
								hex={hex}
								onClick={handleHexClick}
							/>
						</g>
					))}
				</g>

				<g
					className="selected-kingdom-stroke"
					transform={`translate(${HEX_PADDING} ${HEX_PADDING})`}
					strokeLinecap="round"
					strokeWidth="5"
					stroke="white"
				>
					{arbiter.currentKingdom
						? arbiter.currentKingdom.hexs.map((hex) => (
								<HexCell empty key={hex.hash} hex={hex} />
						  ))
						: ''}
				</g>
				<g
					className="selected-kingdom"
					transform={`translate(${HEX_PADDING} ${HEX_PADDING})`}
				>
					{arbiter.currentKingdom
						? arbiter.currentKingdom.hexs.map((hex) => (
								<HexCell
									key={hex.hash}
									clickable={hex.hasTower() || hex.hasCapital()}
									movable={
										hex.player === arbiter.currentPlayer &&
										hex?.entity?.played === false
									}
									hex={hex}
									onClick={handleHexClick}
								/>
						  ))
						: ''}
				</g>

				{showKingdomDefense ? (
					<KingdomDefense
						setShowKingdomDefense={setShowKingdomDefense}
						kingdom={showKingdomDefense}
						world={arbiter.world}
						layout={layout}
					/>
				) : (
					''
				)}
			</Layout>
		</HexGrid>
	)
}

Openhex.propTypes = {
	width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	arbiter: PropTypes.instanceOf(Arbiter).isRequired,
	onUpdate: PropTypes.func,
	onArbiterError: PropTypes.func,
	onHexClick: PropTypes.func,
}

Openhex.defaultProps = {
	width: '100%',
	height: '100%',
	onUpdate: () => null,
	onArbiterError: () => null,
	onHexClick: () => null,
}

export default Openhex
