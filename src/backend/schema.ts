import { gql } from 'apollo-server';
//import { makeExecutableSchema } from 'graphql-tools';
import { IResolvers } from 'apollo-server-express';
import { getUsers } from './user/service';

export const typeDefs = gql`
type User {
  id: Int!
  firstname: String!
  lastname: String!
  email: String!
  img: String
  createdAt: String
  status: Int!
}

type Query {
  users(periodFilter: Int, search: String): [User]
}

type Mutation {
  register(firstname: String, lastname: String, email: String, image: String): User
}
`;

export const resolvers: IResolvers = {
  Query: {
    users: (parent, { periodFilter, search }) => getUsers(periodFilter, search)
  },
  // Mutation: {
  //   register: (parent, { firstname, lastname, email, image }, context) => {
  //     // upload image to S3
  //     // insert row to DB
  //   }
  // }
};