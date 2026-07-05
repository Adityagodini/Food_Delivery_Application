const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({
            error: "Token is required"
        });
    }

    try {
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing");

            return res.status(500).json({
                error: "Server configuration error"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("Decoded token:", decoded);

        const vendor = await Vendor.findById(
            decoded.vendorId
        );

        if (!vendor) {
            return res.status(404).json({
                error: "Vendor not found"
            });
        }

        req.vendorId = vendor._id;

        console.log(
            "Verified Vendor ID:",
            req.vendorId
        );

        next();

    } catch (error) {
        console.error(
            "TOKEN VERIFICATION ERROR:",
            error.message
        );

        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }
};

module.exports = verifyToken;