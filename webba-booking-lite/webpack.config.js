const defaultConfig = require('@wordpress/scripts/config/webpack.config.js')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const FastGlob = require('fast-glob')
const PrefixSelectorPlugin = require('./src/webpack/PrefixSelectorPlugin.js')

const getSrcJsEntries = () => {
    const jsFilePaths = FastGlob.sync([
        './src/**/index.js',
        '!./src/block/**/*',
    ])

    const entries = {}

    jsFilePaths.forEach((filePath) => {
        const folderName = filePath.split('/')[2]
        entries[folderName] = filePath
    })

    return entries
}

const defaultEntries = defaultConfig.entry()
const srcJsEntries = getSrcJsEntries()
const defaultPlugins = defaultConfig.plugins.filter(
    (plugin) => !(plugin instanceof MiniCSSExtractPlugin)
)

const imageAssetsRegex = /\.(bmp|png|jpe?g|gif|webp)$/i

const defaultRules = defaultConfig.module.rules.filter(
    (rule) => String(imageAssetsRegex) !== String(rule.test)
)

/** @type {import('webpack').WebpackOptionsNormalized} */
const config = {
    ...defaultConfig,
    plugins: [
        new PrefixSelectorPlugin({
            includedScopes: ['admin/'],
            prefix: `body[class*='webba-booking-wp-root']`,
        }),
        new MiniCSSExtractPlugin({
            filename: (pathData) => {
                if (!pathData.chunk.runtime.includes('block/')) {
                    return '[name]/index.css'
                }

                return '[name].css'
            },
        }),
        ...defaultPlugins,
    ],
    entry: {
        ...defaultEntries,
        ...srcJsEntries,
        'wizard_page': './src/scss/wizard_page.scss',
    },
    output: {
        ...defaultConfig.output,
        filename: (pathData) => {
            if (!pathData.runtime.includes('block/')) {
                return '[name]/index.js'
            }

            return defaultConfig.output.filename
        },
    },
    module: {
        ...defaultConfig.module,
        rules: [
            ...defaultRules,
            {
                test: imageAssetsRegex,
                type: 'asset/inline',
            },
            {
                test: /\.scss$/,
                use: [
                    'postcss-loader',
                    'sass-loader',
                    {
                        loader: 'sass-resources-loader',
                        options: {
                            resources: [
                                './src/scss/config/config.scss'
                            ],
                        },
                    },
                ],
            },
        ],
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
    },
    optimization: {
        splitChunks: false,
    },
}

module.exports = config
