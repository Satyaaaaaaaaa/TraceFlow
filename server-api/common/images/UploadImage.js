const multer = require('multer');
const path = require('path');
const router = require('express').Router();

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 6 } // 5 MB limit
});

// Image upload endpoint
router.post('/', upload.array('image', 6), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        error: 'No files uploaded'
      });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      imageUrl: `/${file.path}` // Add imageUrl field
    }));

    // If single file, return single imageUrl for backward compatibility
    if (req.files.length === 1) {
      return res.json({
        status: true,
        message: "Image uploaded successfully",
        imageUrl: `/${req.files[0].path}`,
        file: files[0]
      });
    }

    // Multiple files
    res.json({
      status: true,
      message: "Images uploaded successfully",
      files,
      imageUrls: files.map(f => f.imageUrl) // Array of URLs
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message
    });
  }
});

module.exports = router;