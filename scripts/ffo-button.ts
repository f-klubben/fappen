import config from "../config";
import {AppDatabase, StoredToken} from "./database";

const {oidc} = config;

const refresh_margin = 60_000;
let refresh_in_flight: Promise<StoredToken | null> | null = null;

interface RefreshResponse {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
}

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

async function refresh_token(token: StoredToken): Promise<StoredToken | null> {
    const response = await fetch(`${oidc.issuer}/o/token/`, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
            client_id: oidc.client_id,
            grant_type: "refresh_token",
            refresh_token: token.refresh_token,
        }),
    });

    if (!response.ok) {
        if (response.status === 400 || response.status === 401) {
            const current: StoredToken = await AppDatabase.instance.settings
                .get(AppDatabase.access_token_key);

            if (current != null && current.value !== token.value)
                return current;

            await AppDatabase.instance.settings.delete(AppDatabase.access_token_key);
        }
        return null;
    }

    const body: RefreshResponse = await response.json();
    const refreshed: StoredToken = {
        value: body.access_token,
        expires_at: Date.now() + body.expires_in * 1000,
        refresh_token: body.refresh_token ?? token.refresh_token,
    };

    await AppDatabase.instance.settings.put(refreshed, AppDatabase.access_token_key);
    return refreshed;
}

export async function get_access_token(): Promise<string | null> {
    const token: StoredToken = await AppDatabase.instance.settings
        .get(AppDatabase.access_token_key);

    if (token == null)
        return null;
    if (token.expires_at > Date.now() + refresh_margin)
        return token.value;
    if (token.refresh_token == null)
        return null;

    refresh_in_flight ??= refresh_token(token)
        .finally(() => { refresh_in_flight = null; });

    return (await refresh_in_flight)?.value ?? null;
}

export async function revoke_token(token: string): Promise<void> {
    await fetch(`${oidc.issuer}/o/revoke_token/`, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({client_id: oidc.client_id, token}),
    });
}

export function bind_sso_buttons(root: ParentNode = document): void {
    root.querySelectorAll<HTMLButtonElement>(".fclub-sso-button")
        .forEach(button => button.addEventListener("click", () => {
            void login_with_sso();
        }));
}
