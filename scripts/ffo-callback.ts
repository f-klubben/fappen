const clientId: string = "fappen";
const tokenAuthEndpoint: string = "http://127.0.0.1:8000/o/token/";

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    [key: string]: unknown;
}

async function handleCallback(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const code: string | null = params.get("code");
    const returnedState: string | null = params.get("state");

    // No OIDC callback → do nothing, silently
    if (!code || !returnedState) {
        return;
    }

    const expectedState: string | null =
        sessionStorage.getItem("oidc_state");
    const verifier: string | null =
        sessionStorage.getItem("pkce_verifier");

    // Cleanup early to avoid replay issues
    sessionStorage.removeItem("oidc_state");
    sessionStorage.removeItem("pkce_verifier");

    // Hard failure, but still non-intrusive
    if (!expectedState || returnedState !== expectedState || !verifier) {
        console.warn("OIDC callback validation failed");
        return;
    }

    let response: Response;
    try {
        response = await fetch(tokenAuthEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: clientId,
                grant_type: "authorization_code",
                code,
                code_verifier: verifier,
                redirect_uri: window.location.origin + window.location.pathname,
            }),
        });
    } catch (err) {
        console.warn("Token request failed", err);
        return;
    }

    if (!response.ok) {
        console.warn("Token endpoint returned error", response.status);
        return;
    }

    const tokenResponse: TokenResponse = await response.json();

    // At this point auth succeeded — you decide what “login” means
    console.log("OIDC token response:", tokenResponse);

    // Optional: clean URL (no reload)
    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );
}

// Safe to call on every page load
handleCallback();