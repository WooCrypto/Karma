/**
 * API Fetch Helper with Auto-Fallback and Retry Mechanisms.
 * Centrally coordinates API routing to bypass Vercel/Custom Domain 404s
 * by falling back to the direct Cloud Run backend with linear backoff retries.
 */

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function fetchWithFallback(urlPath: string, options: RequestOptions = {}): Promise<Response> {
  const { timeoutMs = 8000, ...restOptions } = options;

  // Primary: original relative path (perfect for localhost, platform previews, and local execution)
  const primaryUrl = urlPath;
  
  // Secondary: production sandbox/index Cloud Run instance
  const secondaryUrl = `https://ais-pre-6wdjsh77mxlo43trbw7pj5-274157962229.us-east1.run.app${urlPath}`;
  
  // Tertiary: development workspace Instance
  const tertiaryUrl = `https://ais-dev-6wdjsh77mxlo43trbw7pj5-274157962229.us-east1.run.app${urlPath}`;

  const urlsToTry: string[] = [];

  const isCustomDomain = typeof window !== 'undefined' && 
    !window.location.hostname.includes('run.app') && 
    !window.location.hostname.includes('localhost') && 
    !window.location.hostname.includes('127.0.0.1');

  if (isCustomDomain) {
    // Put external absolute endpoints first, as they are guaranteed to reach the active backend
    urlsToTry.push(secondaryUrl, tertiaryUrl, primaryUrl);
  } else {
    // Relative environment is preferred first
    urlsToTry.push(primaryUrl, secondaryUrl, tertiaryUrl);
  }

  // Deduplicate list
  const uniqueUrls = Array.from(new Set(urlsToTry));
  let lastError: any = null;

  for (const url of uniqueUrls) {
    // Max 2 retries per URL to avoid long waiting times
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          ...restOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Vercel or cloud gateways return 404 NOT_FOUND for unmapped backend services.
        // Also catch Cloudflare/Vercel error pages or text responses with HTML/NOT_FOUND payloads.
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (response.status === 404 || (!response.ok && !isJson)) {
          throw new Error(`Upstream error [HTTP ${response.status}] from ${url} (non-API response)`);
        }

        // Return successful response immediately
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`[API Fallback Logger] URL: ${url} | Attempt ${attempt}/2 failed. Error:`, err?.message || err);

        // Linear delay backoff: 300ms, 600ms...
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
        }
      }
    }
  }

  throw lastError || new Error(`Network failure: Unable to synchronize with reputation index on any server routes.`);
}
