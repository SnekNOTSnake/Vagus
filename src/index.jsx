import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import './components/styles/global.css'
import './fonts/roboto/stylesheet.css'
import style from './components/styles/index.module.css'

// Preload a lazy component
const lazyWithPreload = (factory) => {
	const Component = React.lazy(factory)
	Component.preload = factory
	return Component
}

// Lazy loads
const App = React.lazy(() => import('./components/App'))
const Game = lazyWithPreload(() => import('./components/game/Game'))
const Custom = React.lazy(() => import('./components/Custom'))
const Credits = React.lazy(() => import('./components/Credits'))
const Rules = React.lazy(() => import('./components/Rules'))
const NotFound = React.lazy(() => import('./components/404'))

// Enable Webpack HMR. Don't worry about production
// It only leaves very small footprint
if (module.hot) module.hot.accept()

const PreloadGame = () => {
	React.useEffect(() => {
		Game.preload()
	}, [])
	return ''
}

// Loader
const Loader = () => (
	<div className={style.Loader}>
		<div className={style.spinner} />
	</div>
)

// Service Worker
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/service-worker.js')
			.then((registration) => {
				// eslint-disable-next-line no-console
				console.log('SW registered: ', registration)
			})
			.catch((registrationError) => {
				// eslint-disable-next-line no-console
				console.log('SW registration failed: ', registrationError)
			})
	})
}

ReactDOM.render(
	<React.StrictMode>
		<PreloadGame />
		<Router>
			<React.Suspense fallback={<Loader />}>
				<Switch>
					<Route exact path="/" render={() => <App />} />
					<Route
						exact
						path="/game"
						render={(routerProps) => <Game routerProps={routerProps} />}
					/>
					<Route
						exact
						path="/custom"
						render={(routerProps) => <Custom routerProps={routerProps} />}
					/>
					<Route exact path="/credits" render={() => <Credits />} />
					<Route exact path="/rules" render={() => <Rules />} />
					<Route exact path="/*" render={() => <NotFound />} />
				</Switch>
			</React.Suspense>
		</Router>
	</React.StrictMode>,
	document.querySelector('#root'),
)
