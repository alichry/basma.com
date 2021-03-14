import React from 'react'
import { Redirect, RouteProps, Route } from 'react-router-dom';
import { store } from './context';

const ProtectedRoute: React.FC<RouteProps> = (props) => {
  return store.getState().admin.token ? (
    <Route {...props} />
  ) : (
    <Redirect to={{ pathname: '/admin/login' }} />
  )
}

export default ProtectedRoute;