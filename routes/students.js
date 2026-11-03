import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

// GET /api/students - Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/students/:id - Get student by studentId
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error.message);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// POST /api/students - Add new student
router.post('/', async (req, res) => {
  try {
    const { studentId, name, email, department, semester, contact } = req.body;

    // Validate required fields
    if (!studentId || !name || !email || !department || !semester || !contact) {
      return res.status(400).json({
        error: 'All fields are required: studentId, name, email, department, semester, contact',
      });
    }

    // Check for duplicate studentId
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res
        .status(409)
        .json({ error: `Student with ID '${studentId}' already exists` });
    }

    const student = new Student({
      studentId,
      name,
      email,
      department,
      semester,
      contact,
    });

    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error('Error creating student:', error.message);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// PUT /api/students/:id - Update student by studentId
router.put('/:id', async (req, res) => {
  try {
    const { name, email, department, semester, contact } = req.body;

    const student = await Student.findOneAndUpdate(
      { studentId: req.params.id },
      { name, email, department, semester, contact },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    console.error('Error updating student:', error.message);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// DELETE /api/students/:id - Delete student by studentId
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ studentId: req.params.id });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error.message);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

export default router;
