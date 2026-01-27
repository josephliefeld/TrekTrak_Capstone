export type Profile = {
    profile_id: string;
    username: string;
    email: string;
    password: string;
};

export async function getProfile(userId: string): Promise<Profile> {
    await new Promise((res) => setTimeout(res, 500));

    return {
        profile_id: userId,
        username: "testUser",
        email: "testUser@oregonstate.edu",
        password: "testPass123$",
    };
}