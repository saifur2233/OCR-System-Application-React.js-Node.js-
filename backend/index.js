// server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ocr_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Record Schema
const recordSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    extractedText: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        default: 'eng',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Record = mongoose.model('Record', recordSchema);

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});

// Routes

// Upload image and perform OCR
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const imagePath = req.file.path;
        const language = req.body.language || 'eng';
        const processedPath = `uploads/processed-${Date.now()}.png`;
        const imageUrl = `/uploads/${req.file.filename}`;

        console.log('Starting preprocessing for:', imagePath);

        // Step 1: Preprocess image using Sharp
        await sharp(imagePath)
            .grayscale()                       // convert to grayscale
            .threshold(150)                    // binarize: text black, background white
            .normalize()                       // normalize contrast
            .toFile(processedPath);

        console.log('Preprocessing completed. Saved to:', processedPath);

        console.log('Starting OCR processing for:', processedPath, 'with language:', language);

        // Perform OCR using Tesseract.js
        const { data: { text } } = await Tesseract.recognize(processedPath, language, {
            logger: m => console.log(m), // Optional: log OCR progress
        });

        console.log('OCR completed. Extracted text:', text.substring(0, 100) + '...');

        // Save to MongoDB
        const newRecord = new Record({
            imageUrl: imageUrl,
            extractedText: text.trim(),
            language: language,
        });

        const savedRecord = await newRecord.save();

        res.status(201).json({
            success: true,
            message: 'Image processed and record saved successfully',
            record: savedRecord,
        });

        // Optional: clean up intermediate files
        if (fs.existsSync(processedPath)) fs.unlinkSync(processedPath);

    } catch (error) {
        console.error('Error processing image:', error);

        // Clean up uploaded file if OCR fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            error: 'Failed to process image',
            details: error.message,
        });
    }
});

// Get all records or search records
app.get('/api/records', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            // Case-insensitive search in extractedText
            query = {
                extractedText: { $regex: search, $options: 'i' }
            };
        }

        const records = await Record.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            records: records,
            count: records.length,
        });

    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).json({
            error: 'Failed to fetch records',
            details: error.message,
        });
    }
});

// Get single record by ID
app.get('/api/records/:id', async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.json({
            success: true,
            record: record,
        });

    } catch (error) {
        console.error('Error fetching record:', error);
        res.status(500).json({
            error: 'Failed to fetch record',
            details: error.message,
        });
    }
});

// Delete record
app.delete('/api/records/:id', async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);

        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }

        // Delete associated image file
        const imagePath = path.join(__dirname, record.imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Record.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Record deleted successfully',
        });

    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({
            error: 'Failed to delete record',
            details: error.message,
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'OCR API is running',
        timestamp: new Date().toISOString(),
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }

    res.status(500).json({
        error: 'Something went wrong!',
        details: error.message,
    });
});

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT. Graceful shutdown...');
    await mongoose.connection.close();
    process.exit(0);
});