import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  HttpLink,
  from
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { store } from './context';

const httpLink = new HttpLink({ uri: "/graphql" });

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: `Bearer ${store.getState().admin.token}`,
    }
  }));

  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    )
  }
  if (networkError) {
    console.log(`[Network error]: ${JSON.stringify(networkError)}`)
  }
});


const client = new ApolloClient({
  cache: new InMemoryCache({ addTypename: false }),
  link: from([
    authMiddleware,
    errorLink,
    httpLink
  ])
});

export default client;
