import { Schema, model } from "mongoose";

const dogSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minLength: [3, 'Name must be at least 3 characters long'], // Minimum length validation
    maxLength: [20, 'Name must be less than 20 characters long'], // Maximum length validation
    index: true // Indexing the name for faster search queries
  },
  breed: {
    type: String,
  },
  age: {
    type: Number,
    min: [1, 'Age must be greater than or equal to 1'] // Age must be greater than or equal to 1
  },
  weight: {
    type: Number,
    min: 0
  },
  ownerId: {
    type: String,
  }
});

export default model("Dog", dogSchema);
