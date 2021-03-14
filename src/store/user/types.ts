export interface UserState {
    firstName?: string,
    lastName?: string,
    email?: string
}

export interface UserAction {
    type: UserActionType,
    payload: UserState
}

export enum UserActionType {
    SET_REGISTRATION_DATA = '@@user/SET_REGISTRATION_DATA',
    DELETE_REGISTRATION_DATA = '@@user/DELETE_REGISTRATION_DATA'
}