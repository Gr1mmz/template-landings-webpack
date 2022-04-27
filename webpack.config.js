const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {defaultMinimizerOptions} = require('html-loader');
const TerserPlugin = require('terser-webpack-plugin');

const srcFolder = 'src';
const buildFolder = 'dist';

const paths = {
  src: path.resolve(srcFolder),
  build: path.resolve(buildFolder)
}

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

const mode = isDev ? 'development' : 'production';
console.log(mode + ' mode');

module.exports = {
  context: path.resolve(__dirname, paths.src),
  mode: mode,
  entry: './js/main.js',
  output: {
    path: path.resolve(__dirname, paths.build),
    filename: `./js/${filename('js')}`,
    publicPath: '',
    clean: true,
  },
  devServer: {
    historyApiFallback: true,
    static: buildFolder,
    open: true,
    compress: true,
    hot: true,
    port: 3000,
  },
  devtool: 'inline-source-map',
  optimization: {
    splitChunks: {chunks: 'all'},
    minimize: isProd,
    minimizer: [new TerserPlugin()]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, `${srcFolder}/index.html`),
      filename: 'index.html',
      minify: isProd
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `./img`, to: `img`,
          noErrorOnMissing: false,
          force: true
        },
        {
          from: `./assets`, to: `./`,
          noErrorOnMissing: true,
          force: true
        },
        {
          from: `./favicon.ico`, to: `./`,
          noErrorOnMissing: true
        }
      ],
    }),
    new MiniCssExtractPlugin({filename: `./css/${filename('css')}`})
  ],
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: "html-loader",
        options: {
          minimize: {
            ...defaultMinimizerOptions,
            removeComments: true,
            collapseWhitespace: true,
          },
        },
      },
      {
        test: /\.(scss|css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + "/";
              },
            },
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 0,
              sourceMap: false,
              modules: false,
              url: {
                filter: (url, resourcePath) => {
                  if (url.includes("img") || url.includes("fonts")) {
                    return false;
                  }
                  return true;
                },
              },
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                outputStyle: "expanded",
              },
            }
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
}