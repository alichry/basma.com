import { createBrowserHistory } from 'history';
import configureStore from './configureStore';

export const history = createBrowserHistory();
export const initialState = window.INITIAL_REDUX_STATE;

export const {
  store,
  persistor
} = configureStore(history, initialState);
