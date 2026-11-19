const clientId: string = "fappen";

export async function loginWithOIDC(scopes: string[]): Promise<void> {
    const redirectUri: string = "http://localhost:1234/";
    const issuerAuthEndpoint: string = "http://127.0.0.1:8000/o/authorize";

    // CSRF protection
    const state: string = crypto.randomUUID();

    // PKCE
    const verifier: string = crypto.randomUUID() + crypto.randomUUID();
    const encoder: TextEncoder = new TextEncoder();
    const data: Uint8Array = encoder.encode(verifier);

    const hash: ArrayBuffer = await crypto.subtle.digest("SHA-256", data);
    const challenge: string = btoa(
        String.fromCharCode(...new Uint8Array(hash))
    )
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    sessionStorage.setItem("oidc_state", state);
    sessionStorage.setItem("pkce_verifier", verifier);

    const params: URLSearchParams = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scopes.join(" "),
        state,
        code_challenge: challenge,
        code_challenge_method: "S256",
    });

    window.location.href = `${issuerAuthEndpoint}?${params.toString()}`;
}

document.querySelectorAll<HTMLButtonElement>(".fclub-sso-button")
    .forEach(button => {
        button.addEventListener("click", () => {
            const scopes = button.dataset.scopes?.split(" ") ?? [];
            loginWithOIDC(scopes);
        });
    });
