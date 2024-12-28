const defaultConfig = require('@wordpress/scripts/config/webpack.config.js')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const { sync: glob } = require('fast-glob')

const getSrcJsEntries = () => {
    const jsFilePaths = glob(['./src/**/index.js', '!./src/block/**/*'])
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
        ...defaultPlugins,
        new MiniCSSExtractPlugin({
            filename: (pathData) => {
                if (!pathData.chunk.runtime.includes('block/')) {
                    return '[name]/index.css'
                }
                return '[name].css'
            },
        }),
    ],
    entry: {
        ...defaultEntries,
        ...srcJsEntries,
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
        ],
    },
}

module.exports = config
