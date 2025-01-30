import { ListContextProvider } from "./ListContextProvider.js";

const endpoint = '/deck/ui-web-components/data/ccaa.json';

export class ListContextProviderCcaa extends ListContextProvider {

	context = 'CC.AA.';

	task = async ({ signal }) => {
		const response = await fetch(endpoint, { signal });
		if (!response.ok) { throw new Error(response.status); }
		return response.json();
	}
}