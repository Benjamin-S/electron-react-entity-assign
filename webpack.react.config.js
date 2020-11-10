const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('./plugins/interpolateHtmlPlugin');

const publicUrl = './public';

module.exports = {
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
		mainFields: ['main', 'module', 'browser']
	},
	entry: './src/index.tsx',
	target: 'electron-renderer',
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.(js|ts|tsx)$/,
				exclude: [path.resolve(__dirname, '/node_modules/')],
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					// Creates `style` nodes from JS strings
					'style-loader',
					// Translates CSS into CommonJS
					'css-loader',
					// Compiles Sass to CSS
					'sass-loader'
				]
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(png|jpe?g|gif|icon?)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[sha512:hash:base64:7].[ext]'
						}
					}
				]
			},
			{
				test: /\.ttf$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[sha512:hash:base64:7].[ext]'
						}
					}
				]
			}
		]
	},
	devServer: {
		contentBase: path.join(__dirname, './build'),
		historyApiFallback: true,
		compress: true,
		hot: true,
		port: 4000,
		publicPath: '/'
	},
	output: {
		path: path.resolve(__dirname, './build'),
		filename: 'js/[name].js',
		publicPath: publicUrl + '/'
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, './public/index.html')
		}),
		new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
			PUBLIC_URL: publicUrl
		})
	]
};
