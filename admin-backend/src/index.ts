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
  await AppDataSource.initialize();
  console.log('Database connected');

  const app = express();
  app.use(cors());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      return { isAdmin: token === 'admin' };
    },
  });

  await server.start();
  server.applyMiddleware({ app: app as any, path: '/graphql' });

  app.listen(PORT, () => {
    console.log(`Admin GraphQL server running at http://localhost:${PORT}/graphql`);
  });
}

main().catch(console.error);
