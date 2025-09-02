# OCR System Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- Git

## Project Structure
```
ocr-system/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── uploads/ (created automatically)
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── index.html
```

## Backend Setup

### 1. Create Backend Directory
```bash
mkdir ocr-system
cd ocr-system
mkdir backend
cd backend
```

### 2. Initialize and Install Dependencies
```bash
npm init -y
npm install express mongoose multer cors tesseract.js path fs
npm install --save-dev nodemon
```

### 3. Create server.js
Copy the backend code from the artifact above.

### 4. Start MongoDB
Make sure MongoDB is running:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (update connection string in server.js)
```

### 5. Run Backend Server
```bash
npm run dev
# or
npm start
```

The backend will run on `http://localhost:5000`

## Frontend Setup

### 1. Create Frontend Directory
```bash
cd ../
mkdir frontend
cd frontend
```

### 2. Initialize Vite React Project
```bash
npm create vite@latest . -- --template react
```

### 3. Install Additional Dependencies
```bash
npm install
npm install lucide-react axios react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4. Configure Files
- Copy the frontend code from the artifacts above
- Update `tailwind.config.js`, `postcss.config.js`, `vite.config.js`
- Replace `src/App.jsx`, `src/main.jsx`, `src/index.css`, and `index.html`

### 5. Run Frontend
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Features

### Language Support
The OCR system now supports 20+ languages including:
- **Western Languages**: English, Spanish, French, German, Italian, Portuguese, Dutch, Polish, Swedish, Turkish
- **Asian Languages**: Chinese (Simplified & Traditional), Japanese, Korean, Thai, Vietnamese
- **Other Languages**: Russian, Arabic, Hindi, Bengali

### API Endpoints
- `POST /api/upload` - Upload image with language selection for OCR processing
- `GET /api/records` - Get all records
- `GET /api/records?search=xxx` - Search records by extracted text
- `DELETE /api/records/:id` - Delete a specific record
- `GET /api/health` - Health check

### Frontend Features
- **Language Selection**: Dropdown with flags and language names
- **Responsive Design**: Works on desktop and mobile
- **Real-time Search**: Filter records as you type
- **Image Preview**: See uploaded images before processing
- **Progress Indication**: Loading states during OCR processing
- **Notifications**: Success/error messages
- **Delete Functionality**: Remove records with confirmation

## Usage

1. **Upload & Extract**: 
   - Select OCR language from dropdown
   - Upload an image file
   - Click "Extract Text" to process
   - View extracted text and save to database

2. **Browse Records**: 
   - Navigate to Records page
   - Search through extracted text
   - View all processed images and their text
   - Delete unwanted records

## Notes

- **File Size Limit**: 10MB per image
- **Supported Formats**: PNG, JPG, JPEG, GIF, BMP, TIFF, WebP
- **OCR Processing**: May take 10-30 seconds depending on image complexity
- **Language Detection**: For best results, select the correct language before processing
- **Database**: Records include image URL, extracted text, selected language, and timestamp

## Troubleshooting

1. **MongoDB Connection**: Ensure MongoDB is running and accessible
2. **CORS Issues**: Backend includes CORS middleware for cross-origin requests
3. **File Upload**: Check uploads directory permissions
4. **OCR Performance**: Large or complex images may take longer to process
5. **Language Packs**: Tesseract.js downloads language packs automatically on first use
