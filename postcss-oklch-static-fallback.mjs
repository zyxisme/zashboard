/**
 * PostCSS plugin to replace oklch() values that have dynamic alpha (calc/var)
 * with static rgba() equivalents. This handles cases where
 * @csstools/postcss-oklab-function can't evaluate the expression.
 *
 * Currently handles pure black/white oklch with dynamic alpha:
 * - oklch(0% 0 0 / <alpha>)   -> rgba(0, 0, 0, <alpha>)
 * - oklch(100% 0 0 / <alpha>) -> rgba(255, 255, 255, <alpha>)
 * - oklch(1 0 0 / <alpha>)    -> rgba(255, 255, 255, <alpha>)
 */

// Find oklch( ... ) with balanced parentheses
function findOklchWithCalc(value) {
  const results = [];
  let i = 0;
  while (i < value.length) {
    const idx = value.indexOf('oklch(', i);
    if (idx === -1) break;

    // Find balanced closing paren
    let depth = 1;
    let j = idx + 6;
    while (j < value.length && depth > 0) {
      if (value[j] === '(') depth++;
      else if (value[j] === ')') depth--;
      j++;
    }

    if (depth === 0) {
      const expr = value.slice(idx, j);
      if (expr.includes('calc(')) {
        results.push({ start: idx, end: j, expr });
      }
    }
    i = idx + 1;
  }
  return results;
}

function isPureBlack(lightness) {
  const l = lightness.trim();
  return l === '0%' || l === '0';
}

function isPureWhite(lightness) {
  const l = lightness.trim();
  return l === '100%' || l === '1' || l === '1.0' || l === '1.00';
}

function postcssOklchStaticFallback() {
  return {
    postcssPlugin: 'postcss-oklch-static-fallback',
    Declaration(decl) {
      if (!decl.value || !decl.value.includes('oklch')) return;

      const matches = findOklchWithCalc(decl.value);
      if (matches.length === 0) return;

      // Process from end to start to preserve indices
      let newValue = decl.value;
      for (let i = matches.length - 1; i >= 0; i--) {
        const { start, end, expr } = matches[i];

        // Parse: oklch(L C H / alpha)
        const inner = expr.slice(6, -1); // Remove oklch( and )
        const slashIdx = inner.indexOf('/');
        if (slashIdx === -1) continue;

        const beforeSlash = inner.slice(0, slashIdx).trim();
        const alpha = inner.slice(slashIdx + 1).trim();

        const parts = beforeSlash.split(/\s+/);
        if (parts.length < 3) continue;

        const lightness = parts[0];

        let replacement;
        if (isPureBlack(lightness)) {
          replacement = `rgba(0, 0, 0, ${alpha})`;
        } else if (isPureWhite(lightness)) {
          replacement = `rgba(255, 255, 255, ${alpha})`;
        } else {
          continue; // Can't handle non-black/white oklch with dynamic alpha
        }

        newValue = newValue.slice(0, start) + replacement + newValue.slice(end);
      }

      if (newValue !== decl.value) {
        decl.value = newValue;
      }
    },
  };
}

postcssOklchStaticFallback.postcss = true;

export default postcssOklchStaticFallback;
