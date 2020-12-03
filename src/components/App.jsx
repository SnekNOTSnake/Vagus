import React from 'react'
import { Link } from 'react-router-dom'
import { HexGrid, Layout, Hexagon, Text } from 'react-hexgrid'
import style from './styles/App.module.css'

const layout = new Layout()
layout.size = { x: 18, y: 18 }
layout.spacing = 1.05
layout.origin = { x: 0, y: -10 }
layout.orientation = Layout.LAYOUT_FLAT

const App = () => {
	return (
		<div className={`${style.App} literature`}>
			<div className="maxWidth">
				<h1>Vagus</h1>
				<div className={style.menu}>
					<HexGrid width="100%" height="100%" viewBox="-50 -50 100 100">
						<Layout
							size={layout.size}
							flat={layout.orientation === Layout.LAYOUT_FLAT}
							spacing={layout.spacing}
							origin={layout.origin}
						>
							<g className="menu-hexs">
								<Link to="/custom">
									<Hexagon
										className={`${style.menuHex} fill-color-2`}
										q={0}
										r={0}
										s={0}
									>
										<Text className="fill-color-black">Custom</Text>
									</Hexagon>
								</Link>
								<Link to="/rules">
									<Hexagon
										className={`${style.menuHex} fill-color-1`}
										q={0}
										r={1}
										s={-1}
									>
										<Text className="fill-color-white">Rules</Text>
									</Hexagon>
								</Link>
								<Link to="/credits">
									<Hexagon
										className={`${style.menuHex} fill-color-0`}
										q={1}
										r={0}
										s={-1}
									>
										<Text className="fill-color-white">Credits</Text>
									</Hexagon>
								</Link>
								<Hexagon
									className={`${style.menuHex} fill-color-white disabled`}
									q={-1}
									r={1}
									s={0}
								>
									<Text className="fill-color-black">Online</Text>
								</Hexagon>
								<Link to="/game">
									<Hexagon
										className={`${style.menuHex} fill-color-0`}
										q={-1}
										r={0}
										s={1}
									>
										<Text className="fill-color-white">Quick Jab</Text>
									</Hexagon>
								</Link>
							</g>
						</Layout>
					</HexGrid>
				</div>
			</div>
		</div>
	)
}

export default App
