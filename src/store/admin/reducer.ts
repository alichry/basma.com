import { Reducer } from 'redux'
import { AdminState, AdminAction, AdminActionType } from './types';

const initialState: AdminState = {
  username: undefined,
  token: undefined
};

const reducer: Reducer<AdminState, AdminAction> = (state = initialState, action) => {
  switch (action.type) {
  case AdminActionType.ADMIN_LOGIN:
    return { ...state, ...action.payload }
  case AdminActionType.ADMIN_LOGOUT:
    return {}
  default:
    return state
  }
}

export { reducer as adminReducer };