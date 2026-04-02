export interface ILandingPageProps {
    token: string
    token_type: 'customer_token' | 'admin_token'
    action: string
}