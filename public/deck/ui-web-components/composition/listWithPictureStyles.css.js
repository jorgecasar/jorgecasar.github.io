import { css } from 'https://cdn.skypack.dev/lit';

export const listWithPictureStyles = css`
:host {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
	grid-template-rows: repeat(auto-fill, minmax(var(--size-9), 1fr));
	column-gap: var(--size-7);
	row-gap: var(--size-3);
	overflow: auto;
	block-size: calc(calc(var(--size-9) * 4) + calc(var(--size-3) * 3));
}

h3 {
	margin: 0;
	font-size: var(--font-size-fluid-1);
}

p {
	grid-column: 1 / -1;
}

.error {
	color: var(--red-6);
}
`;