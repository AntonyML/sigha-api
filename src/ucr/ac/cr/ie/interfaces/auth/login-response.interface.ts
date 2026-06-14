export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user: {
        id: number;
        uEmail: string;
        uName: string;
        roles: string[];
    };
    requiresTwoFactor?: boolean;
    tempToken?: string;
}
