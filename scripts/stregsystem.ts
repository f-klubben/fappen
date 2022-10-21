const base_url: string = "https://stregsystem.fklub.dk/";

export interface UserProfile {
    username: string,
    name: string,
    email: string,
    id: number,
    balance: number,
}

/**
 * Check whether stregsystem is available from the current network.
 */
export async function check_access(): Promise<boolean> {
    return (await fetch(base_url)).status == 443;
}

export async function fetch_profile(username: string): Promise<UserProfile?> {
    let user_id = await fetch(`${base_url}api/member/get_id?username=${username}`);

    return { username: "", id: 0 };
}

export async function purchase(profile: UserProfile, item_id: number) {

}

export async function save_profile(profile: UserProfile) {}