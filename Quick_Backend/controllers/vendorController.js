const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const vendorRegister = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const normalizedEmail = email.trim().toLowerCase();

        const vendorEmail = await Vendor.findOne({
            email: normalizedEmail
        });

        if (vendorEmail) {
            return res.status(400).json({
                error: "Email already taken"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newVendor = new Vendor({
            username: username.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        await newVendor.save();

        return res.status(201).json({
            message: "Vendor registered successfully"
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};


const vendorLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log("LOGIN REQUEST RECEIVED");

        const normalizedEmail = email.trim().toLowerCase();

        const vendor = await Vendor.findOne({
            email: normalizedEmail
        });

        if (!vendor) {
            console.log("VENDOR NOT FOUND");

            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        console.log("VENDOR FOUND:", vendor.email);

        const passwordMatch = await bcrypt.compare(
            password,
            vendor.password
        );

        if (!passwordMatch) {
            console.log("PASSWORD NOT MATCHED");

            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        console.log("PASSWORD MATCHED");

        console.log(
            "JWT SECRET EXISTS:",
            Boolean(process.env.JWT_SECRET)
        );

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET IS MISSING");

            return res.status(500).json({
                error: "JWT_SECRET missing on server"
            });
        }

        const token = jwt.sign(
            {
                vendorId: vendor._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        console.log("TOKEN CREATED SUCCESSFULLY");

        return res.status(200).json({
            success: "Login successful",
            token,
            vendorId: vendor._id
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            error: error.message
        });
    }
};


const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().populate('firm');

        return res.json({
            vendors
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};


const getVendorById = async (req, res) => {
    const vendorId = req.params.apple;

    try {
        const vendor = await Vendor
            .findById(vendorId)
            .populate('firm');

        if (!vendor) {
            return res.status(404).json({
                error: "Vendor not found"
            });
        }

        const vendorFirmId =
            vendor.firm && vendor.firm.length > 0
                ? vendor.firm[0]._id
                : null;

        return res.status(200).json({
            vendorId,
            vendorFirmId,
            vendor
        });

    } catch (error) {
        console.error("GET VENDOR ERROR:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
};


module.exports = {
    vendorRegister,
    vendorLogin,
    getAllVendors,
    getVendorById
};