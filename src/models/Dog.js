import { Schema, model } from "mongoose";

const dogSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minLength: [3, 'Name must be at least 3 characters long'],
    maxLength: [20, 'Name must be less than 20 characters long'],
    index: true
  },
  breed: {
    type: String,
    required: [true, 'Breed is required']
  },
  age: {
    type: Number,
    min: [0, 'Age must be greater than or equal to 0']
  },
  weight: {
    type: Number,
    min: 0
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Gender is required']
  },
  ownerName: {
    type: String,
    required: [true, 'Owner Name is required']
  },
  imageUrl: {
    type: String,
    default: 'https://cdn2.iconfinder.com/data/icons/veterinary-12/512/Veterinary_Icons-16-512.png'
  }
});

export default model("Dog", dogSchema);
