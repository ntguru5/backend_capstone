import { Schema, model } from "mongoose";

const bathroomLogSchema = new Schema({
  dogId: {
    type: Schema.Types.ObjectId,
    ref: "Dog",
    required: true,
    index: true // Indexing dogId for quick lookup by dog
  },
  type: {
    type: String,
    enum: ['pee', 'poop'],
    required: [true, 'Type is required'], // Type is required and must be either 'pee' or 'poop'
  },
  time: {
    type: Date,
    default: Date.now,
    index: true // Indexing for faster retrieval of recent bathroom logs
  },
  location: {
    type: String,
  },
  notes: {
    type: String,
  }
});

export default model("BathroomLog", bathroomLogSchema);
