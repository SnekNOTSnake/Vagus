import React from 'react'
import PropTypes from 'prop-types'
import { buyUnit, buyTower } from '../hooks/hookUtils'
import Arbiter from '../../engine/Arbiter'
import Themes from '../../themes/Themes'
import Unit from '../../engine/Unit'
import Tower from '../../engine/Tower'

/**
 * @typedef {import('../../engine/Arbiter').default} Arbiter
 * @typedef {import('../../engine/Hex').default} Hex
 * @typedef {import('../../engine/Kingdom').default} Kingdom
 */

/**
 * @param {{ arbiter: Arbiter, selection: Hex, currentKingdom: Kingdom }} param
 */
const KingdomMenu = ({ arbiter, selection, setSelection, currentKingdom }) => {
	const handleBuyUnit = () => buyUnit(setSelection)
	const handleBuyTower = () => buyTower(setSelection)

	const renderSelection = () => {
		if (selection === null) return ''
		return (
			<img
				alt="selection"
				src={Themes.getImageFor(
					selection instanceof Unit || selection instanceof Tower
						? selection
						: selection.entity,
				)}
			/>
		)
	}

	const renderDifference = () => {
		const difference = currentKingdom.getDifference()
		return difference >= 0 ? (
			<span>
				(<span style={{ color: 'rgb(31, 142, 36)' }}>+{difference}</span>)
			</span>
		) : (
			<span>
				(<span style={{ color: 'rgb(220, 0, 78)' }}>{difference}</span>)
			</span>
		)
	}

	return (
		<div className="KingdomMenu">
			<div className="stats">
				<div className="gold">
					<h2>
						<img src={Themes.getImageForGold(currentKingdom.gold)} alt="" />{' '}
						{currentKingdom.gold}
						{renderDifference()}
					</h2>
					<p>Income: {currentKingdom.getIncome()}</p>
					<p>Outcome: {currentKingdom.getOutcome()}</p>
				</div>
				<div className="selection">
					<h2>Selection</h2>
					<div className="figure">{renderSelection()}</div>
				</div>
			</div>
			<div className="store">
				<button
					className={`bg-color-${arbiter.currentPlayer.color}`}
					disabled={currentKingdom.gold < 10}
					onClick={handleBuyUnit}
					type="button"
				>
					<img src={Themes.getImageFor(new Unit())} alt="buy unit" />{' '}
					<span>10</span>
				</button>
				<button
					className={`bg-color-${arbiter.currentPlayer.color}`}
					disabled={currentKingdom.gold < 15}
					onClick={handleBuyTower}
					type="button"
				>
					<img src={Themes.getImageFor(new Tower())} alt="buy tower" />{' '}
					<span>15</span>
				</button>
			</div>
		</div>
	)
}

KingdomMenu.propTypes = {
	arbiter: PropTypes.instanceOf(Arbiter).isRequired,
	selection: PropTypes.object,
	setSelection: PropTypes.func.isRequired,
	currentKingdom: PropTypes.object,
}

KingdomMenu.defaultProps = {
	selection: null,
	currentKingdom: null,
}

export default KingdomMenu
