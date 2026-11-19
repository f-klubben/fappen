import config from "../config";

const {oidc} = config;

export const redirect_uri = `${window.location.origin}/`;

const base64url = (buffer: ArrayBuffer): string =>
    btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

export async function login_with_sso(): Promise<void> {
    const state = crypto.randomUUID();
    const verifier = crypto.randomUUID() + crypto.randomUUID();
    const challenge = base64url(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)),
    );

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

export function bind_sso_buttons(root: ParentNode = document): void {
    root.querySelectorAll<HTMLButtonElement>(".fclub-sso-button")
        .forEach(button => button.addEventListener("click", () => {
            void login_with_sso();
        }));
}
