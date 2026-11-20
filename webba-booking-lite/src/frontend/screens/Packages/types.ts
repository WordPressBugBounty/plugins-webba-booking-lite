export interface PackageLoginResponse {
    token?: string
    user?: {
        ID?: number
        user_login?: string
        user_email?: string
        display_name?: string
    }
}
