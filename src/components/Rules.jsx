import React from 'react'
import { Link } from 'react-router-dom'

const Rules = () => {
	return (
		<div className="Rules literature">
			<div className="maxWidth">
				<Link className="backButton" to="/" />

				<section>
					<h1>Rules</h1>
					<p>
						The rules written in here are ripped off from{' '}
						<a href="https://antiyoy.fandom.com/">Antiyoy</a>&apos;s guide book.
					</p>
				</section>

				<section>
					<h2>Units</h2>
					<p>
						There are 4 unit types. They differ only by strength. In ascending
						order of strength:
					</p>
					<ol>
						<li>Peasant</li>
						<li>Swordsman</li>
						<li>Wizard</li>
						<li>Lord</li>
					</ol>
					<p>
						Units give adjacent cells under your control protection equal to
						strength.
						<br />
						To capture a cell, the unit strength must be bigger than protection.
					</p>
					<p>Every unit consumes 2, 6, 18, 54 coins per turn.</p>
				</section>

				<section>
					<h2>Trees</h2>
					<p>
						Trees spawn after dead units
						<br />
						A cell with a tree gives no income.
						<br /> It means that trees harm economy.
					</p>
					<p>
						You have to cut them down. Otherwise they will grow and kill your
						economy. <br />
						Mangroves spawn at edges and grow very quickly. They have to be cut
						very quickly.
					</p>
				</section>

				<section>
					<h2>Towers</h2>
					<p>
						Towers are used to protect adjacent cells.
						<br />
						Towers give protection 2. Therefore, only Wizards and Lords can
						fight it. <br />
						Castles give protection 1.
					</p>
					<p>
						At the beginning of game this is the best way to protect your
						territory. <br />
						Tower price is low and they don&apos;t requires maintenance cost.
					</p>
				</section>

				<section>
					<h2>Gold</h2>
					<p>
						Income depends on number of cells. <br />
						Bigger territory has bigger income. <br />
						Trees decrease income.
					</p>
					<p>
						Units requires maintenance cost. <br />
						Powerful units consume more gold.
						<br />
						When gold runs out, all units die.
					</p>
				</section>

				<section>
					<h2>Tactics</h2>
					<p>
						Defend all your cells whenever possible.
						<br />
						Make sure that your income is good enough before hiring powerful
						units.
						<br />
						Cut enemy territories to pieces in order to destroy their economy.
					</p>
				</section>

				<section>
					<h2>Keyboard Shortcuts</h2>
					<ul>
						<li>Buy Unit - A</li>
						<li>Buy Tower - S</li>
						<li>Undo - E</li>
						<li>End Turn - R</li>
					</ul>
				</section>

				<Link className="backButtonStatic" to="/" />
			</div>
		</div>
	)
}

export default Rules
