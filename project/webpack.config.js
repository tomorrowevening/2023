const path = require('path');
const pathOutput = path.resolve(__dirname, 'dist');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const env = process.env.NODE_ENV;
const isProd = env === 'production';

const assets = {
  audio: false,
  images: true,
  json: true,
  models: false,
  video: false
};

const plugins = [
  new CopyPlugin({
    patterns: [
      {
        from: './public/index.html',
        to: pathOutput
      },
    ],
  }),
  new MiniCssExtractPlugin({
    filename: 'main.css'
  })
];

for (let i in assets) {
  if (assets[i]) {
    plugins.push(new CopyPlugin({
      patterns: [
        {
          from: `./public/${i}`,
          to: `${pathOutput}/${i}`
        }
      ]
    }));
  }
}

if (!isProd) {
  plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = {
  mode: isProd ? env : 'development',
  devServer: {
    contentBase: pathOutput,
    compress: true,
    port: 8080
  },
  entry: {
    app: './src/index.ts'
  },
  devtool: isProd ? 'source-map' : 'inline-source-map',
  output: {
    filename: 'main.js',
    path: pathOutput
  },
  optimization: {
    minimize: isProd,
    minimizer: [
      new HtmlMinimizerPlugin(),
      new CssMinimizerPlugin(),
      new TerserPlugin({
        extractComments: true,
      })
    ]
  },
  resolve: {
    alias: {
      '@scss': path.resolve(__dirname, 'src/scss/'),
      '@ts': path.resolve(__dirname, 'src/scripts/'),
      '@glsl': path.resolve(__dirname, 'src/shaders/')
    },
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        exclude: /\.d\.ts/
      },
      {
        test: /\.html$/i,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]'
        }
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: [
          'raw-loader',
          'glslify-loader'
        ]
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      }
    ]
  },
  plugins
};