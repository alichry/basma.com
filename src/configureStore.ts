import { Store, createStore, applyMiddleware } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import { History } from 'history'
import { ApplicationState, createRootReducer } from './store'
import { persistStore, Persistor } from 'redux-persist';
import { composeWithDevTools } from 'redux-devtools-extension';

interface StoreConfig {
  store: Store<ApplicationState>
  persistor: Persistor
}

export default function configureStore(
  history: History,
  initialState: any
): StoreConfig {
  const composeEnhancers = composeWithDevTools({})

  const rootReducer = createRootReducer(history);
  const store = createStore(
    rootReducer,
    initialState,
    composeEnhancers(applyMiddleware(routerMiddleware(history)))
    //compose(applyMiddleware(routerMiddleware(history)))
  )
  const persistor = persistStore(store);
  return { store, persistor };
}