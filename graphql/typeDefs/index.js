import { gql } from 'apollo-server-express'

export default gql`
  type Message {
    id: ID!
    text: String
    createdBy: String
  }

  input MessageInput {
    text: String!
    username: String!
  }

  type Query {
    messages: [Message!]
  }

  type Mutation {
    createMessage(messageInput: MessageInput): Message!
  }

  type Subscription {
    messageCreated(to: String!): Message
  }
`
