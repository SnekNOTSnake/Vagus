import React from 'react'
import { Hexagon } from 'react-hexgrid'
import PropTypes from 'prop-types'
import Hex from '../../engine/Hex'
import Themes from '../../themes/Themes'

/**
 * @typedef {import('../../engine/Hex.js').default} Hex
 */

const HEX_SIZE = 20

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
const HexCell = ({ hex, onClick, movable, clickable }) => {
	const classes = ['HexCell']
	if (hex?.player?.color !== undefined)
		classes.push(`fill-color-${hex.player.color}`)
	if (movable || clickable) classes.push('clickable')

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
			{hexContent(hex, movable)}
		</Hexagon>
	)
}

HexCell.propTypes = {
	hex: PropTypes.instanceOf(Hex).isRequired,
	onClick: PropTypes.func,
	movable: PropTypes.bool,
	clickable: PropTypes.bool,
}

HexCell.defaultProps = {
	onClick: () => null,
	movable: false,
	clickable: false,
}

export default HexCell
