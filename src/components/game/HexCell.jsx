import React from 'react'
import { Hexagon } from 'react-hexgrid'
import PropTypes from 'prop-types'
import { HEX_SIZE } from '../../constants/variables'
import Hex from '../../engine/Hex'
import Themes from '../../themes/Themes'

/**
 * @typedef {import('../../engine/Hex.js').default} Hex
 */

/**
 * @param {Hex} hex
 * @param {Boolean} movable
 */
const hexContent = (hex, movable) => {
	if (hex.entity === null) return ''

	return (
		<image
			className={movable ? 'movable-unit' : ''}
			x={(HEX_SIZE / 2) * -1}
			y={(HEX_SIZE / 2) * -1}
			width={HEX_SIZE}
			height={HEX_SIZE}
			xlinkHref={Themes.getImageFor(hex.entity)}
		/>
	)
}

/**
 * @param {{ hex: Hex }} param
 */
const HexCell = ({ hex, empty, onClick, movable, clickable }) => {
	const classes = React.useMemo(() => {
		const array = ['HexCell']
		if (hex?.player?.color !== undefined && !empty)
			array.push(`fill-color-${hex.player.color}`)
		if (empty) array.push('fill-color-shadow')
		if (movable || clickable) array.push('clickable')

		return array
	}, [clickable, empty, hex?.player?.color, movable])

	const onClickHandler = (e) => {
		onClick(hex, e)
	}

	return (
		<Hexagon
			className={classes.join(' ')}
			q={hex.q}
			r={hex.r}
			s={hex.s}
			onClick={onClickHandler}
		>
			{empty ? '' : hexContent(hex, movable)}
		</Hexagon>
	)
}

HexCell.propTypes = {
	hex: PropTypes.instanceOf(Hex).isRequired,
	empty: PropTypes.bool,
	movable: PropTypes.bool,
	clickable: PropTypes.bool,
	onClick: PropTypes.func,
}

HexCell.defaultProps = {
	onClick: () => null,
	movable: false,
	clickable: false,
	empty: false,
}

export default HexCell
