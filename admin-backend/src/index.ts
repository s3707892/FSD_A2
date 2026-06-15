// entry point for the admin graphql server using apollo and express
import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { AppDataSource } from './data-source';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

const PORT = process.env.PORT || 4000;

async function main() {
  // wait for the database to be ready before accepting requests
  await AppDataSource.initialize();
  console.log('Database connected');

  const app = express();
  app.use(cors());

  // pass a basic isAdmin flag through context using the authorization header
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      return { isAdmin: token === 'admin' };
    },
  });

  await server.start();
  // expose the graphql playground and api at /graphql
  server.applyMiddleware({ app: app as any, path: '/graphql' });

  app.listen(PORT, () => {
    console.log(`Admin GraphQL server running at http://localhost:${PORT}/graphql`);
  });
}

main().catch(console.error);
