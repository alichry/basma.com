import { combineReducers } from 'redux'
import { connectRouter, RouterState } from 'connected-react-router'
import { AdminAction, AdminState } from './admin/types'
import { adminReducer } from './admin/reducer'
import { UserState } from './user/types'
import { registrationReducer } from './user/reducer'
import { History } from 'history'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

export interface ApplicationState {
  admin: AdminState,
  user: UserState,
  router: RouterState
}

const adminPersistConfig = {
  key: 'admin',
  storage,
  whitelist: ['username', 'token']
}


export const createRootReducer = (history: History) => {
  const rootReducer = combineReducers({
    admin: persistReducer<AdminState, AdminAction>(
      adminPersistConfig,
      adminReducer
    ),
    user: registrationReducer,
    router: connectRouter(history)
  })
  return rootReducer
}
