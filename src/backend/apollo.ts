import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './schema';

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
});

export default apolloServer;