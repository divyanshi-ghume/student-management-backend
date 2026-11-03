import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    bookId: { type: String, required: [true, "bookId is required"], unique: true, trim: true },
    title: { type: String, required: [true, "title is required"], trim: true },
    author: { type: String, required: [true, "author is required"], trim: true },
    category: { type: String, required: [true, "category is required"], trim: true },
    copies: { type: Number, required: [true, "copies is required"], min: [0, "copies cannot be negative"], validate: { validator: Number.isInteger, message: "copies must be a whole number" } },
    publishedYear: { type: Number }
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
