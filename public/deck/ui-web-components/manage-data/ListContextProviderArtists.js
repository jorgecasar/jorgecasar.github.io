import { ListContextProvider } from "./ListContextProvider.js";

const endpoint = '/deck/ui-web-components/data/artists.json';

export class ListContextProviderArtists extends ListContextProvider {

	context = 'Artistas';

	task = async ({ signal }) => {
		const response = await fetch(endpoint, { signal });
		if (!response.ok) { throw new Error(response.status); }
		return response.json();
	}
}