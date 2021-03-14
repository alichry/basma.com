import React from 'react';
import {
  Switch,
  Route
} from "react-router-dom";
import Register from './Register';
import Login from './Login';
import Admin from './Admin';
import Verification from './Verification';
import { Store } from 'redux';
import { ApplicationState } from './store';
import { History } from 'history';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ApolloProvider } from '@apollo/client';
import client from './MyApolloClient';
import { Persistor } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import ProtectedRoute from './ProtectedRoute';
import './App.css';

interface AppProps {
  store: Store<ApplicationState>,
  persistor: Persistor,
  history: History
}

const App: React.FC<AppProps> = ({ store, persistor, history }) => {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ConnectedRouter history={history}>
            <Switch>
              <Route path="/" exact={true} component={Register} />
              <Route path="/user/verify/:token" component={Verification} />
              <Route path="/admin/login" component={Login} />
              <ProtectedRoute path="/admin/dashboard" component={Admin} />
            </Switch>
          </ConnectedRouter>
        </PersistGate>
      </Provider>
    </ApolloProvider>
  );
}

export default App;
