export type UserRole = 'Owner' | 'Manager' | 'Staff'

export interface User {
    id:string
    firstName:string,
    secondName:string
    email:string,
    tenantId:string
    role:UserRole
    avatarUrl?:string,
    propertyId?:string
}

export interface AuthResponse{
    responseDto:{
        accessToken:string
        refreshToken:string
        userDto:User;
    }
}

export interface LoginRequest  {
    email:string
    password:string
}