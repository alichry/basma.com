import { action } from 'typesafe-actions';
import { UserState, UserActionType } from './types';

export const setRegistrationData = (user: UserState) => action(
  UserActionType.SET_REGISTRATION_DATA,
  user
);

export const deleteRegistrationData = () => action(UserActionType.DELETE_REGISTRATION_DATA);
