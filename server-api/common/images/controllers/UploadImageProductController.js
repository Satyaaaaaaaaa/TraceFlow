const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { Image } = require("../../models/Image");

// ---------- MULTER CONFIG ----------

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/products/");
  },

  filename(req, file, cb) {
    const imageUUID = crypto.randomUUID();
    file.imageUUID = imageUUID; // for later

    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `img_${imageUUID}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (
      file.mimetype.startsWith("image/") &&
      [".jpg", ".jpeg", ".png"].includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Images only (jpg, jpeg, png)"));
    }
  }
});

// ---------- CONTROLLER ----------

module.exports = (req, res) => {
  upload.array("image", 6)(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: false,
        error: err.message
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: false,
        error: "No images uploaded"
      });
    }

    try {
      // Insert images into DB with position
      const imageRecords = req.files.map((file, index) => ({
        uuid: file.imageUUID,
        position: index
      }));

      await Image.bulkCreate(imageRecords);

      return res.status(201).json({
        status: true,
        message: "Images uploaded",
        image_uuids: imageRecords.map(img => img.uuid)
      });

    } catch (dbError) {
      return res.status(500).json({
        status: false,
        error: "Failed to save images"
      });
    }
  });
};
