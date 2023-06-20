import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export function verifyToken(token: string) {
    if (token == process.env.KEYWORD_AUTH) {
        return {
            sub: "logged_user"
        }
    }
    throw new Error("Token is invalid or user doesn't exists");
}

export function checkAuth(cookies: ReadonlyRequestCookies) {
    let token: string | undefined;

    if (cookies.has("token")) {
        token = cookies.get("token")?.value;
    }

    return verifyToken(token || '');
}
