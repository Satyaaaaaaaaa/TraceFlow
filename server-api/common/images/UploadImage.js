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
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  },
  limits: { fileSize: 5 * 1024 * 1024, files : 6 } // 5 MB limit
});


// Image upload endpoint
router.post('/', upload.array('image', 6), (req, res) => {
  try {
    const files = req.files.map(file => ({
      filename: file.filename,
      path: file.path
    }));

    res.json({
      message: "Images uploaded successfully",
      files
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;