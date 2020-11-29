import React from 'react'
import PropTypes from 'prop-types'
import { HexGrid, Layout } from 'react-hexgrid'
import HexCell from './HexCell'
import KingdomDefense from './KingdomDefense'
import MoveZone from './MoveZone'
import { createViewBox } from '../utils/helpers'
import Arbiter from '../../engine/Arbiter'

/**
 * @typedef {import('../../engine/Hex.js').default} Hex
 * @typedef {import('../../engine/HexUtils.js').default} HexUtils
 * @typedef {import('../../engine/Arbiter.js').default} Arbiter
 */

const HEX_SIZE = 20
const HEX_PADDING = 10

const layout = new Layout()
layout.size = { x: HEX_SIZE, y: HEX_SIZE }
layout.spacing = 0.99
layout.origin = { x: 0, y: 0 }
layout.orientation = Layout.LAYOUT_FLAT

/**
 * @param {{ arbiter: Arbiter }} props
 */
const Openhex = (props) => {
	const {
		arbiter,
		width,
		height,
		currentKingdom,
		onHexClick,
		selection,
	} = props
	const [showKingdomDefense, setShowKingdomDefense] = React.useState(null)

	const handleHexClick = (hex) => {
		if ((hex.hasTower() || hex.hasCapital()) && hex.kingdom === currentKingdom)
			setShowKingdomDefense(hex.kingdom)

		onHexClick(hex)
	}

	const viewBox = React.useMemo(
		() => createViewBox(arbiter.world.hexs, layout, HEX_PADDING),
		[arbiter.world.hexs],
	)

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
									hex.kingdom !== currentKingdom
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
					{currentKingdom
						? currentKingdom.hexs.map((hex) => (
								<HexCell empty key={hex.hash} hex={hex} />
						  ))
						: ''}
				</g>
				<g
					className="selected-kingdom"
					transform={`translate(${HEX_PADDING} ${HEX_PADDING})`}
				>
					{currentKingdom
						? currentKingdom.hexs.map((hex) => (
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

				{selection ? (
					<MoveZone
						kingdom={currentKingdom}
						world={arbiter.world}
						selection={selection}
					/>
				) : (
					''
				)}

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
	currentKingdom: PropTypes.object,
	selection: PropTypes.object,
	onHexClick: PropTypes.func,
}

Openhex.defaultProps = {
	currentKingdom: null,
	selection: null,
	width: '100%',
	height: '100%',
	onHexClick: () => null,
}

export default Openhex
