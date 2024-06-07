export const DPRS = [1, 1.5, 2, 3];

/**
 * Generate image widths taking 
 */
export const calculateWidths = (widths, defaultWidth = widths[0], densities = DPRS) =>
	widths.reduce(
		(acc, curr) => [...acc, ...densities.map((dpr) => curr * dpr)], [defaultWidth])
		.filter((value, index, all) => all.indexOf(value) === index)
		.sort((a, b) => a - b);