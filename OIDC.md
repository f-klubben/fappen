# Fappen OIDC client

Register Fappen as an application in Stregsystemet's Django admin, under
*OAuth2 Provider* → *Applications* → *Add application*:

| Field                      | Value                                        |
|----------------------------|----------------------------------------------|
| Name                       | Fappen                                       |
| Client id                  | `fappen`                                     |
| Client secret              | *(leave empty)*                              |
| Client type                | Public                                       |
| Authorization grant type   | Authorization code                           |
| Redirect uris              | `https://fappen.fklub.dk/`                   |
| Post logout redirect uris  | *(leave empty)*                              |
| Algorithm                  | RSA with SHA-2 256                           |
| Skip authorization         | unchecked                                    |

Leave the secret empty: Fappen is a static webapp and authenticates as a public
client with PKCE.

For local development add `http://localhost:1234/` and `http://127.0.0.1:1234/`
to the same space-separated redirect field. Fappen builds its `redirect_uri`
from the browser origin, so every hostname it is opened on has to be listed;
an unlisted one fails with `Mismatching redirect URI.`

`config.ts` reads `FA_OIDC_ISSUER`, `FA_OIDC_CLIENT_ID` and `FA_OIDC_SCOPE`,
defaulting to `http://127.0.0.1:8000`, `fappen` and
`openid profile member:id member:balance member:active member:name`. The scope
must include `openid profile`, otherwise the ID token carries no `username`
claim.
