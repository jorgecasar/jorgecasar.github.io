import { ListContextProvider } from "./ListContextProvider.js";

export class ListContextProviderEmpty extends ListContextProvider {

	context = 'Vacío';

	task = () => ([])
}