import React from 'react'
import PropTypes from 'prop-types'
import { Hexagon } from 'react-hexgrid'
import HexUtils from '../../engine/HexUtils'
import Themes from '../../themes/Themes'

const HEX_SIZE = 20

/**
 * @typedef { import('../../engine/Hex').default } Hex
 * @typedef { import('../../engine/World').default } World
 *
 * @param {{ hex: Hex, world: World }} param0
 */
const ProtectedHexs = ({ hex, world, layout }) => {
	const [shields, setShields] = React.useState([])
	const [show, setShow] = React.useState(false)

	React.useEffect(() => {
		const neighbourBrothers = HexUtils.neighbourHexs(world, hex)
			.filter((neighbourHex) => neighbourHex.kingdom === hex.kingdom)
			.filter((nHex) => !nHex.hasCapital() && !nHex.hasTower())

		const originInitPixel = HexUtils.hexToPixel(hex, layout)
		const originCoords = [
			originInitPixel.x - layout.size.x,
			originInitPixel.y - layout.size.y,
		]

		const shieldCandidates = neighbourBrothers.map((neighbourBrother) => {
			const initPixel = HexUtils.hexToPixel(neighbourBrother, layout)
			const coords = [initPixel.x, initPixel.y]

			coords[0] -= layout.size.x
			coords[1] -= layout.size.y

			const [distanceX, distanceY] = [
				coords[0] - originCoords[0],
				coords[1] - originCoords[1],
			]

			return {
				hex: neighbourBrother,
				distance: [distanceX, distanceY],
			}
		})

		setShields(shieldCandidates)

		const timeout = setTimeout(() => setShow(true), 25)
		return () => clearTimeout(timeout)
	}, [hex, layout, world])

	return (
		<g transform="translate(10 10)">
			{shields.map((shield, i) => (
				<g
					// eslint-disable-next-line react/no-array-index-key
					key={i}
					className="shield"
					style={{
						transform: show
							? `translate(${shield.distance[0]}px, ${shield.distance[1]}px)`
							: 'translate(0px, 0px)',
						animationName: 'shieldFade',
					}}
				>
					<Hexagon
						className="fill-color-transparent"
						q={hex.q}
						r={hex.r}
						s={hex.s}
					>
						<image
							x={(HEX_SIZE / 2) * -0.75}
							y={(HEX_SIZE / 2) * -0.75}
							width={HEX_SIZE / 1.25}
							height={HEX_SIZE / 1.25}
							xlinkHref={Themes.getSpecialImageFor('shield')}
						/>
					</Hexagon>
				</g>
			))}
		</g>
	)
}

ProtectedHexs.propTypes = {
	hex: PropTypes.object.isRequired,
	world: PropTypes.object.isRequired,
	layout: PropTypes.object.isRequired,
}

/**
 * @param {{ kingdom: import('../../engine/Kingdom').default }} param
 */
const KingdomDefense = ({ kingdom, setShowKingdomDefense, world, layout }) => {
	React.useEffect(() => {
		const timeout = setTimeout(() => setShowKingdomDefense(null), 2000)
		return () => clearTimeout(timeout)
	}, [setShowKingdomDefense, kingdom])

	return (
		<g style={{ pointerEvents: 'none' }} className="KingdomDefense">
			{kingdom.hexs
				.filter((hex) => hex.hasCapital() || hex.hasTower())
				.map((hex) => (
					<ProtectedHexs
						world={world}
						key={hex.hash}
						hex={hex}
						layout={layout}
					/>
				))}
		</g>
	)
}

KingdomDefense.propTypes = {
	kingdom: PropTypes.object.isRequired,
	setShowKingdomDefense: PropTypes.func.isRequired,
	world: PropTypes.object.isRequired,
	layout: PropTypes.object.isRequired,
}

export default KingdomDefense
