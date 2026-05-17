import { pegadaianConfig as config } from './config';
import route from './route';

export function register() {
	return { name: config.name, displayName: config.displayName, logo: config.logo, favicon: (config as any).favicon ?? null, cover: (config as any).cover ?? null, urlHomepage: config.urlHomepage, route, cached: (config as any).cached ?? true };
}
export { config as pegadaianConfig };
export default route;
