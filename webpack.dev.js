const { merge } = require('webpack-merge')
const common = require('./webpack.common')

module.exports = merge(common, {
	mode: 'development',
	devtool: 'eval-source-map',
	devServer: {
		contentBase: './dist',
		hot: true,
		port: process.env.PORT || 3000,
		historyApiFallback: true, // Enable webpack-dev-server with react-router-dom
	},
})
