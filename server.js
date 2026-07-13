import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import brevo from "@getbrevo/brevo";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

// OTP Send
app.post("/send-otp", async (req, res) => {

    const { email, otp } = req.body;

    try {

        const emailData = new brevo.SendSmtpEmail();

        emailData.sender = {
            name: "MG E-Sport",
            email: process.env.SENDER_EMAIL
        };

        emailData.to = [{
            email: email
        }];

        emailData.subject = "Your OTP Code";

        emailData.htmlContent = `
        <h2>MG E-Sport</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
        `;

        await apiInstance.sendTransacEmail(emailData);

        res.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server Running on Port " + PORT);
});
