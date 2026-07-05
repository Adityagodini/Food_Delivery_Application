const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotEnv = require('dotenv');

dotEnv.config();

const secretKey = process.env.WhatIsYourName



const vendorRegister = async (req, res) => {
    try {
        let { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                error: "Username, email and password are required"
            });
        }

        username = username.trim();
        email = email.trim().toLowerCase();

        const vendorEmail = await Vendor.findOne({ email });

        if (vendorEmail) {
        return res.status(400).json({
            error: "Email already taken"
        });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newVendor = new Vendor({
            username,
            email,
            password: hashedPassword
        });

        const savedVendor = await newVendor.save();

        console.log("Vendor registered:", savedVendor._id);

        return res.status(201).json({
            message: "Vendor registered successfully",
            vendorId: savedVendor._id
        });

    } catch (error) {
        console.error("VENDOR REGISTER ERROR:", error);

        return res.status(500).json({
            error: error.message || "Internal server error"
        });
    }
};

const vendorLogin = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        email = email.trim().toLowerCase();

        const vendor = await Vendor.findOne({ email });

        if (!vendor) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            vendor.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        if (!secretKey) {
            console.error("JWT secret is missing");
            return res.status(500).json({
                error: "Server configuration error"
            });
        }

        const token = jwt.sign(
            { vendorId: vendor._id },
            secretKey,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            success: "Login successful",
            token,
            vendorId: vendor._id
        });

    } catch (error) {
        console.error("VENDOR LOGIN ERROR:", error);

        return res.status(500).json({
            error: error.message || "Internal server error"
        });
    }
};

const getAllVendors = async(req, res) => {
    try {
        const vendors = await Vendor.find().populate('firm');
        res.json({ vendors })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}


const getVendorById = async (req, res) => {
    const vendorId = req.params.apple;

    try {
        const vendor = await Vendor.findById(vendorId).populate('firm');

        if (!vendor) {
            return res.status(404).json({
                error: "Vendor not found"
            });
        }

        // Vendor may not have created a firm yet
        const vendorFirmId =
            vendor.firm && vendor.firm.length > 0
                ? vendor.firm[0]._id
                : null;

        res.status(200).json({
            vendorId,
            vendorFirmId,
            vendor
        });

    } catch (error) {
        console.error("Get vendor error:", error);

        res.status(500).json({
            error: "Internal server error"
        });
    }
};


module.exports = { vendorRegister, vendorLogin, getAllVendors, getVendorById }