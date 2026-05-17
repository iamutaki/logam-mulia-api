import { logammuliaConfig as config } from './config';
import route from './route';

export function register() {
	return { name: config.name, displayName: config.displayName, logo: config.logo, favicon: (config as any).favicon ?? null, urlHomepage: config.urlHomepage, route, cached: (config as any).cached ?? true };
}
export { config as logammuliaConfig };
export default route;
