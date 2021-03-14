import { action } from 'typesafe-actions';
import { AdminActionType, AdminState } from './types';

export const adminLogin = (admin: AdminState) => {
  return action(
    AdminActionType.ADMIN_LOGIN,
    admin
  );
}

export const adminLogout = () => action(AdminActionType.ADMIN_LOGOUT);