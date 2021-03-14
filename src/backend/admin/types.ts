export interface Admin {
    id?: number,
    username: string,
    password: string
}

export interface AdminLogin {
    username: string,
    password: string
}

export type AdminRegister = AdminLogin