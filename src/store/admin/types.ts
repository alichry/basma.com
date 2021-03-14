export interface AdminState {
    username?: string,
    token?: string
}

export interface AdminAction {
    type: AdminActionType,
    payload: AdminState
}

export enum AdminActionType {
    ADMIN_LOGIN = '@@admin/ADMIN_LOGIN',
    ADMIN_LOGOUT = '@@admin/ADMIN_LOGOUT'
}