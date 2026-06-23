import postcss_color_mix from '@csstools/postcss-color-mix-function'
import postcss_oklab from '@csstools/postcss-oklab-function'
import tailwindcss from '@tailwindcss/postcss'
import postcss_conditionals from 'postcss-conditionals'
import postcss_for from 'postcss-for'
import postcssOklchStaticFallback from './postcss-oklch-static-fallback.mjs'

export default {
  plugins: [
    postcss_for(),
    postcss_conditionals(),
    tailwindcss(),
    postcssOklchStaticFallback(),
    postcss_oklab({ preserve: false }),
    postcss_color_mix({ preserve: false }),
  ],
}
