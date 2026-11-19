import config from "../config";
import {AppDatabase} from "./database";
import {fetch_profile} from "./stregsystem";
import {redirect_uri} from "./ffo-button";

const {oidc} = config;

interface TokenResponse {
    id_token: string;
    [key: string]: unknown;
}

async function exchange_code(code: string, verifier: string): Promise<string> {
    const response = await fetch(`${oidc.issuer}/o/token/`, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({
            client_id: oidc.client_id,
            grant_type: "authorization_code",
            code,
            code_verifier: verifier,
            redirect_uri,
        }),
    });

    if (!response.ok)
        throw new Error(`Token request failed: ${response.status}`);

    const token: TokenResponse = await response.json();
    return token.id_token;
}

function member_username(id_token: string): string {
    const base64 = id_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const claims = JSON.parse(new TextDecoder().decode(
        Uint8Array.from(atob(padded), c => c.charCodeAt(0)),
    ));
    return claims.username;
}

async function handle_callback(): Promise<void> {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code == null && state == null && !params.has("error"))
        return;

    const expected_state = sessionStorage.getItem("oidc_state");
    const verifier = sessionStorage.getItem("oidc_verifier");
    const return_to = sessionStorage.getItem("oidc_return") ?? "/";

    sessionStorage.removeItem("oidc_state");
    sessionStorage.removeItem("oidc_verifier");
    sessionStorage.removeItem("oidc_return");

    if (code == null || state !== expected_state || verifier == null) {
        console.warn("OIDC callback validation failed");
        window.location.replace(return_to);
        return;
    }

    try {
        const id_token = await exchange_code(code, verifier);
        const profile = await fetch_profile(member_username(id_token));
        await AppDatabase.instance.settings
            .put(profile, AppDatabase.active_profile_key);
    } catch (err) {
        console.warn("OIDC login failed", err);
    }

    window.location.replace(return_to);
}

void handle_callback();
