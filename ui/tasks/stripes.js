const path = require('path')
const stripesCoreServe  = require('@folio/stripes-core/webpack/serve')
const stripesConfig  = require('../stripes.config')
const DashboardPlugin  = require('webpack-dashboard/plugin')
const webpack  = require('webpack')
const stripesBabel = require ('@folio/stripes-core/webpack/babel-loader-rule')
const reactHotLoader = require('react-hot-loader/babel')
const postCssImport = require('postcss-import')
const autoprefixer = require('autoprefixer')
const postCssCustomProperties = require('postcss-custom-properties')
const postCssCalc = require('postcss-calc')
const postCssNesting = require('postcss-nesting')
const postCssCustomMedia = require('postcss-custom-media')
const postCssMediaMinMax = require('postcss-media-minmax')
const postCssColorFunction = require('postcss-color-function')

const aliases = {
  '@olf/erm-stripes' : path.resolve('src')
}

const baselineModules = path.join(path.resolve('@k-int/stripes-baseline'), 'node_modules')
const dist = path.resolve('dist')
const options = {
  webpackOverrides : (conf) => {
    
    conf.resolve.modules.unshift(baselineModules);
    conf.resolveLoader.modules.unshift(baselineModules);
    console.log('Adding ' + baselineModules + ' to path.');

    Object.keys(aliases).forEach(function(alias) {
      let thePath = aliases[alias];
      conf.resolve.alias[alias] = thePath;
      console.log(`Adding alias ${alias} ${thePath}.`);
    });
    
    conf.output.hotUpdateChunkFilename = 'hot/[id].[hash].hot-update.js'
    conf.output.hotUpdateMainFilename = 'hot/[hash].hot-update.json'
    
    conf.plugins.push(
      new webpack.NamedModulesPlugin()
    )
    
    // Remove the loader rules we don't want/need. Should really filter using the loader type.
    // but as we use a fixed version of stripes we can do this.
    conf.module.rules.splice(0, 1)
    conf.module.rules.splice(conf.module.rules.length -1, 1)
    
    // Add new rules.
    conf.module.rules.push ({
      test: (fileName) => {
        
        if (fileName.lastIndexOf(aliases['@olf/erm-stripes']) > -1 || stripesBabel.test(fileName)) {
          return true
        }
        
        return false;
      },
      use: {
        loader: 'babel-loader',
        options: {
          plugins: [
           require('babel-plugin-syntax-async-functions'),
           require("babel-plugin-transform-decorators-legacy").default,
           require('react-hot-loader/babel'),
          ],
          presets: [
            [require.resolve('babel-preset-env'), { modules: false }],
            [require.resolve('babel-preset-stage-2')],
            [require.resolve('babel-preset-react')],
          ]
        }
      },
    },{
      resource: {
        test: /^.*\.css/
      },
      oneOf: [{
        issuer: {
          test: /@folio/
        },
        use: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'css-loader',
            options: {
              localIdentName: '[local]---[hash:base64:5]',
              modules: true,
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                postCssImport(),
                autoprefixer(),
                postCssCustomProperties(),
                postCssCalc(),
                postCssNesting(),
                postCssCustomMedia(),
                postCssMediaMinMax(),
                postCssColorFunction(),
              ],
              sourceMap: true,
            },
          },
        ],
      },{
        
        // Default to use if top doesn't match
        use: [
          {
            loader: 'style-loader',
            options: {
              sourceMap: true,
            }
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  postCssImport(),
                  require('postcss-url'),
                  autoprefixer(),
                  postCssCustomProperties(),
                  postCssCalc(),
                  postCssNesting(),
                  postCssCustomMedia(),
                  postCssMediaMinMax(),
                  postCssColorFunction(),
    //                require('postcss-prefixwrap')('.kint')
                ];
              },
              sourceMap: true,
            }
          }
        ]
      }],
    });
    return conf;
  }
}

function stripesServe() {
  return stripesCoreServe(stripesConfig, options)
}

module.exports = { stripesServe }
