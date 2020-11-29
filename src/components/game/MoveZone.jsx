import React from 'react'
import PropTypes from 'prop-types'
import { Hexagon } from 'react-hexgrid'
import {
	generateSimpleMoveZone,
	generateMoveZone,
	generateMoveZoneForTower,
} from '../utils/helpers'
import Unit from '../../engine/Unit'
import Tower from '../../engine/Tower'

/**
 * @typedef { import('../../engine/World').default } World
 * @typedef { import('../../engine/Hex').default } Hex
 * @typedef { Hex|Unit } Selection
 */

/**
 * @param {{ world: World, kingdom: Kingdom, selection: Selection }} param
 */
const MoveZone = ({ world, kingdom, selection }) => {
	const moveZone = React.useMemo(() => {
		if (selection instanceof Unit)
			return generateMoveZone(world, kingdom, selection.level)

		if (selection instanceof Tower) return generateMoveZoneForTower(kingdom)

		return generateSimpleMoveZone(world, kingdom, selection.entity.level)
	}, [world, kingdom, selection])

	return (
		<g
			className="MoveZone"
			style={{
				pointerEvents: 'none',
				transform: 'translate(10px, 10px)',
				fill: 'transparent',
			}}
		>
			{moveZone.map((hex) => (
				<Hexagon key={hex.hash} q={hex.q} r={hex.r} s={hex.s}>
					<circle r="3" fill="#fff" />
				</Hexagon>
			))}
		</g>
	)
}

MoveZone.propTypes = {
	world: PropTypes.object,
	selection: PropTypes.object,
	kingdom: PropTypes.object,
}

MoveZone.defaultProps = {
	world: null,
	selection: null,
	kingdom: null,
}

export default MoveZone
