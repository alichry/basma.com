import { Reducer } from 'redux'
import { UserActionType, UserState, UserAction } from './types';

const initialState: UserState = {};

const reducer: Reducer<UserState, UserAction> = (state = initialState, action) => {
  switch (action.type) {
  case UserActionType.SET_REGISTRATION_DATA:
    return { ...state, ...action.payload }
  case UserActionType.DELETE_REGISTRATION_DATA:
    return {}
  default:
    return state
  }
}

export { reducer as registrationReducer };