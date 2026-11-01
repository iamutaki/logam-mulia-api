export type Bindings = {
	/** Single Jina key (legacy). Used when `JINA_API_KEYS` is empty. */
	JINA_API_KEY?: string;
	/** Comma- or newline-separated Jina API keys; tried in order on 401/402/403. */
	JINA_API_KEYS?: string;
	TURSO_DATABASE_URL?: string;
	TURSO_AUTH_TOKEN?: string;
	DB_D1?: D1Database;
};
