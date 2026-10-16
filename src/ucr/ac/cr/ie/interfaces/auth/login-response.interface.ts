export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user: {
        id: number;
        uEmail: string;
        uName: string;
        roles: string[];
        orgRoles?: string[];
        platformRole?: string | null;
    };
    requiresTwoFactor?: boolean;
    tempToken?: string;
    organizations?: Array<{
        id: number;
        name: string;
        slug: string;
        logoUrl: string | null;
        isPrimary: boolean;
    }>;
}
