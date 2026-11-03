import Book from "../models/Book.js";

const FIELDS = ["title", "author", "category", "copies", "publishedYear"];
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Turns database errors into safe messages (no internal details leak to the client)
function handleError(res, err) {
  if (err.code === 11000) return res.status(409).json({ success: false, message: "A book with this bookId already exists" });
  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: Object.values(err.errors).map((e) => e.message).join(", ") });
  }
  console.error(err);
  return res.status(500).json({ success: false, message: "Server error" });
}

// GET /api/books?search=text
export async function getBooks(req, res) {
  try {
    const search = (req.query.search || "").toString().trim();
    let filter = {};
    if (search) {
      const rx = new RegExp(escapeRegex(search), "i");
      filter = { $or: [{ bookId: rx }, { title: rx }, { author: rx }, { category: rx }] };
    }
    const books = await Book.find(filter).sort({ bookId: 1 });
    res.json({ success: true, count: books.length, data: books });
  } catch (err) { handleError(res, err); }
}

// GET /api/books/:id
export async function getBook(req, res) {
  try {
    const book = await Book.findOne({ bookId: req.params.id });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    res.json({ success: true, data: book });
  } catch (err) { handleError(res, err); }
}

// POST /api/books
export async function createBook(req, res) {
  try {
    const { bookId, ...rest } = req.body;
    const data = { bookId };
    for (const f of FIELDS) if (rest[f] !== undefined) data[f] = rest[f];
    const book = await Book.create(data);
    res.status(201).json({ success: true, message: "Book added successfully", data: book });
  } catch (err) { handleError(res, err); }
}

// PUT /api/books/:id  (bookId itself cannot be changed)
export async function updateBook(req, res) {
  try {
    const changes = {};
    for (const f of FIELDS) if (req.body[f] !== undefined) changes[f] = req.body[f];
    const book = await Book.findOneAndUpdate({ bookId: req.params.id }, changes, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    res.json({ success: true, message: "Book updated successfully", data: book });
  } catch (err) { handleError(res, err); }
}

// DELETE /api/books/:id
export async function deleteBook(req, res) {
  try {
    const book = await Book.findOneAndDelete({ bookId: req.params.id });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    res.json({ success: true, message: "Book deleted successfully" });
  } catch (err) { handleError(res, err); }
}
