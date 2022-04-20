import express from 'express'
import { createServer } from 'http'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'
import { ApolloServer } from 'apollo-server-express'
import mongoose from 'mongoose'
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginDrainHttpServer
} from 'apollo-server-core'
import typeDefs from './graphql/typeDefs/index.js'
import resolvers from './graphql/resolvers/index.js'
;(async function () {
  const app = express()
  const httpServer = createServer(app)

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  })

  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' })

  const serverCleanUp = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    plugins: [
      // Arrêt correct du serveur HTTP.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Playground settings
      ApolloServerPluginLandingPageGraphQLPlayground({
        settings: { 'request.credentials': 'include' }
      }),

      // Arrêt correct du serveur WebSocket.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanUp.dispose()
            }
          }
        }
      }
    ]
  })

  await server.start()

  server.applyMiddleware({ app })

  mongoose.connect('mongodb://localhost:27017/subscriptions', {
    autoIndex: false
  })

  const PORT = 4000
  httpServer.listen(PORT, () =>
    console.log(
      `Server is now running on http://localhost:${PORT}${server.graphqlPath}`
    )
  )
})()
