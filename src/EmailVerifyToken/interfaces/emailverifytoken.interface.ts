export interface EmailVerifyToken {
    _id: string,
    userId: string,
    token: string,
    createdAt: Date
}