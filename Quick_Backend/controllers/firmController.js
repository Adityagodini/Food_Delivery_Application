const Firm = require('../models/Firm');
const Vendor = require('../models/Vendor');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {
        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );
    }
});

const upload = multer({
    storage: storage
});

const addFirm = async (req, res) => {
    try {
        console.log("ADD FIRM REQUEST RECEIVED");
        console.log("Vendor ID:", req.vendorId);
        console.log("Body:", req.body);
        console.log("File:", req.file);

        const {
            firmName,
            area,
            category,
            region,
            offer
        } = req.body;

        if (!req.vendorId) {
            return res.status(401).json({
                message: "Vendor authentication failed"
            });
        }

        const vendor = await Vendor.findById(req.vendorId);

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found"
            });
        }

        if (vendor.firm && vendor.firm.length > 0) {
            return res.status(400).json({
                message: "vendor can have only one firm"
            });
        }

        const image = req.file
            ? req.file.filename
            : undefined;

        const firm = new Firm({
            firmName,
            area,
            category,
            region,
            offer,
            image,
            vendor: [vendor._id]
        });

        const savedFirm = await firm.save();

        vendor.firm.push(savedFirm._id);

        await vendor.save();

        return res.status(200).json({
            message: "Firm Added successfully",
            firmId: savedFirm._id,
            vendorFirmName: savedFirm.firmName
        });

    } catch (error) {
        console.error("ADD FIRM ERROR:", error);

        return res.status(500).json({
            message: "Failed to add firm",
            error: error.message
        });
    }
};

const deleteFirmById = async(req, res) => {
    try {
        const firmId = req.params.firmId;

        const deletedProduct = await Firm.findByIdAndDelete(firmId);

        if (!deletedProduct) {
            return res.status(404).json({ error: "No product found" })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" })
    }
}

module.exports = { addFirm: [upload.single('image'), addFirm], deleteFirmById }