import mongoose from 'mongoose'

const { Schema, model } = mongoose

const messageSchema = new Schema({
  text: String,
  createdBy: String
})

export default model('Message', messageSchema)
