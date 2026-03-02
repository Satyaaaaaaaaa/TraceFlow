const multer = require("multer");
const path = require("path");

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const userId = req.user.id; // from auth middleware
    cb(null, `user_${userId}${ext}`);
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("Images only (jpg, jpeg, png)"));
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// Controller
module.exports = (req, res) => {
  upload.single("image")(req, res, err => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    res.status(201).json({
      message: "Profile image uploaded successfully",
      filename: req.file.filename,
      path: req.file.path
    });
  });
};
