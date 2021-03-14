export interface UserRegistrationInformation {
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    img: string | null | undefined
}

export interface User extends UserRegistrationInformation {
    id: number,
    createdAt?: string,
    status: number
}

export interface UserVerification {
    id: number,
    userId: number,
    token: string,
    createdAt: string
}

export interface UsersStats {
    last24Hours: number,
    lastWeek: number,
    lastMonth: number,
    last3Months: number,
    lastYear: number
}
