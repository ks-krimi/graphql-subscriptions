import { PubSub, withFilter } from 'graphql-subscriptions'
import Message from '../../models/Message.js'

const pubsub = new PubSub()
const MESSAGE_CREATED = 'MESSAGE_CREATED'

export default {
  Query: {
    messages: async (root, args, context, info) => {
      return await Message.find()
    }
  },

  Mutation: {
    createMessage: async (root, { messageInput }, context, info) => {
      const { text, username } = messageInput
      const res = await Message.create({ text, createdBy: username })
      pubsub.publish(MESSAGE_CREATED, {
        messageCreated: { text: text, createdBy: username }
      })
      return {
        id: res.id,
        ...res._doc
      }
    }
  },

  Subscription: {
    messageCreated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(MESSAGE_CREATED),
        (payload, variables) =>
          payload.messageCreated.createdBy === variables.to
      )
    }
  }
}
