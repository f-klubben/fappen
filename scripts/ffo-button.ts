import config from "../config";

const {oidc} = config;

/**
 * The IdP redirects back to the app root, see `ffo-callback`.
 * Must match a registered redirect URI on the `fappen` OAuth application.
 */
export const redirect_uri = `${window.location.origin}/`;

const base64url = (buffer: ArrayBuffer): string =>
    btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

/**
 * Starts the OpenID Connect authorization-code flow (with PKCE),
 * sending the browser to the stregsystem IdP.
 */
export async function login_with_sso(): Promise<void> {
    // CSRF protection
    const state = crypto.randomUUID();

    // PKCE
    const verifier = crypto.randomUUID() + crypto.randomUUID();
    const challenge = base64url(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)),
    );

    // Remember what the callback needs, and where to return the user.
    sessionStorage.setItem("oidc_state", state);
    sessionStorage.setItem("oidc_verifier", verifier);
    sessionStorage.setItem("oidc_return", window.location.pathname);

    const params = new URLSearchParams({
        client_id: oidc.client_id,
        redirect_uri,
        response_type: "code",
        scope: oidc.scope,
        state,
        code_challenge: challenge,
        code_challenge_method: "S256",
    });

    window.location.href = `${oidc.issuer}/o/authorize/?${params.toString()}`;
}

/**
 * Wires every `.fclub-sso-button` below `root` to start the SSO flow.
 */
export function bind_sso_buttons(root: ParentNode = document): void {
    root.querySelectorAll<HTMLButtonElement>(".fclub-sso-button")
        .forEach(button => button.addEventListener("click", () => {
            void login_with_sso();
        }));
}
