// @ts-check

const postcss = require('postcss')
const postcssPrefixSelector = require('postcss-prefix-selector')

module.exports = class PrefixSelectorPlugin {
    /** @type {string[]} */
    includedScopes

    /** @type {string} */
    prefix

    /** @type {import('postcss').Processor} */
    postcss

    constructor(
        opts = {
            /** @type {string[]} */
            includedScopes: [],
            prefix: '',
        }
    ) {
        this.includedScopes = opts.includedScopes
        this.prefix = opts.prefix
        this.postcss = postcss([
            postcssPrefixSelector({
                prefix: opts.prefix,
            }),
        ])
    }

    apply(compiler) {
        // Hook into Webpack's emit phase
        compiler.hooks.thisCompilation.tap(
            'PrefixSelectorPlugin',
            (compilation) => {
                compilation.hooks.processAssets.tap(
                    {
                        name: 'PrefixSelectorPlugin',
                        stage: compiler.webpack.Compilation
                            .PROCESS_ASSETS_STAGE_OPTIMIZE,
                    },
                    (assets) => {
                        const filesToUpdate = Object.keys(assets).filter(
                            (asset) =>
                                asset.endsWith('.css') &&
                                this.includedScopes.some((includedScope) =>
                                    asset.includes(includedScope)
                                )
                        )

                        filesToUpdate.forEach(async (filename) => {
                            const originalCss = assets[filename].source()

                            const prefixedCss =
                                await this.postcss.process(originalCss)

                            compilation.updateAsset(
                                filename,
                                new compiler.webpack.sources.RawSource(
                                    prefixedCss.css
                                )
                            )
                        })
                    }
                )
            }
        )
    }
}
