import type { ScrapingOptions } from '../types/scraper.types';

export const JINA_BASE_URL = 'https://r.jina.ai/';

export class JinaScraper {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private buildProxyUrl(targetUrl: string): string {
    return `${JINA_BASE_URL}${targetUrl}`;
  }

  async fetch(targetUrl: string, options?: ScrapingOptions): Promise<{ text: string; timestamp: string }> {
    const proxyUrl = this.buildProxyUrl(targetUrl);
    const maxAttempts = (options?.retries ?? 1) + 1;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? 15000);

      try {
        const headers: Record<string, string> = {
          Accept: 'text/markdown',
          ...(options?.headers ?? {}),
        };

        if (this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers,
        });

        if (!response.ok) {
          let body = '';
          try { body = await response.text(); } catch { /* ignore */ }
          const bodySnippet = body.slice(0, 180).replace(/\s+/g, ' ').trim();
          const errorMessage = bodySnippet
            ? `HTTP ${response.status}: ${response.statusText} - ${bodySnippet}`
            : `HTTP ${response.status}: ${response.statusText}`;

          // Retry on 429 (rate limit) and 5xx (server errors)
          if ((response.status === 429 || response.status >= 500) && attempt < maxAttempts) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            await new Promise((resolve) => setTimeout(resolve, backoffMs));
            lastError = new Error(errorMessage);
            continue;
          }

          throw new Error(errorMessage);
        }

        const text = await response.text();
        return { text, timestamp: new Date().toISOString() };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown fetch error');
        if (attempt < maxAttempts) {
          continue;
        }
        throw lastError;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw lastError ?? new Error('Unknown fetch error');
  }
}
