import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

let serviceAccount;

try {

    serviceAccount = JSON.parse(
        fs.readFileSync("/etc/secrets/serviceAccountKey.json", "utf8")
    );

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log("✅ Firebase Admin Loaded");

} catch (error) {

    console.log("❌ Firebase Admin Error");
console.error(error);
console.error(error.message);
console.error(error.stack);

}

const app = express();

app.use(cors());
app.use(express.json());

const otpStore = {};

const verifiedUsers = {};

console.log("BREVO API =", process.env.BREVO_API_KEY ? "Loaded" : "Missing");
console.log("BREVO EMAIL =", process.env.BREVO_SENDER_EMAIL ? "Loaded" : "Missing");

app.get("/", (req, res) => {
    res.send("MG E-Sport OTP Server Running ✅");
});

app.post("/send-otp", async (req, res) => {

    try {

        const { email, otp } = req.body;

        otpStore[email] = {
    otp: otp,
    expire: Date.now() + 5 * 60 * 1000
};

        const response = await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "api-key": process.env.BREVO_API_KEY
                },
                body: JSON.stringify({

                    sender: {
                        name: "MG E-Sport",
                        email: process.env.BREVO_SENDER_EMAIL
                    },

                    to: [
                        {
                            email: email
                        }
                    ],

                    subject: "MG E-Sport OTP Verification",

                    htmlContent: `
                    <h2>MG E-Sport</h2>
                    <p>Your OTP is:</p>
                    <h1 style="color:#6f00ff;">${otp}</h1>
                    <p>This OTP is valid for 5 minutes.</p>
                    `

                })
            }
        );

        const result = await response.json();

        console.log("BREVO RESPONSE:", result);

        if (response.ok) {

            return res.json({
                success: true
            });

        } else {

            return res.status(500).json({
                success: false,
                error: result
            });

        }

    } catch (err) {

        console.log("SERVER ERROR:", err);

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

app.post("/verify-otp", (req, res) => {

    const { email, otp } = req.body;

    if (!otpStore[email]) {

        return res.json({
            success: false,
            message: "OTP Not Found"
        });

    }

    if (Date.now() > otpStore[email].expire) {

        delete otpStore[email];

        return res.json({
            success: false,
            message: "OTP Expired"
        });

    }

    if (otpStore[email].otp !== otp) {

        return res.json({
            success: false,
            message: "Invalid OTP"
        });

    }

    delete otpStore[email];

    return res.json({
        success: true
    });

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server Running On Port ${PORT}`);
});