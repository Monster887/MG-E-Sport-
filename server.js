import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Brevo from "@getbrevo/brevo";

dotenv.config();

console.log("API =", process.env.BREVO_API_KEY);
console.log("EMAIL =", process.env.BREVO_SENDER_EMAIL);

const app = express();

app.use(cors());
app.use(express.json());

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
    Brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

app.get("/", (req, res) => {
    res.send("MG E-Sport OTP Server Running ✅");
});

app.post("/send-otp", async (req, res) => {

    try {

        const { email, otp } = req.body;

        let sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = "MG E-Sport OTP Verification";

        sendSmtpEmail.sender = {
            name: "MG E-Sport",
            email: process.env.BREVO_SENDER_EMAIL
        };

        sendSmtpEmail.to = [
            {
                email: email
            }
        ];

        sendSmtpEmail.htmlContent = `
        <h2>MG E-Sport</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        res.json({
            success: true
        });

    } catch (err) {

     console.log("========== BREVO ERROR ==========");
console.log(err);
console.log(err.response);
console.log(err.response?.body);
console.log("================================");

res.status(500).json({
    success: false,
    error: JSON.stringify(err)
});

    }

});

app.post("/test-email", async (req, res) => {

    try {

        let sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = "MG E-Sport Test Email";

        sendSmtpEmail.sender = {
            name: "MG E-Sport",
            email: process.env.BREVO_SENDER_EMAIL
        };

        sendSmtpEmail.to = [
            {
                email: process.env.BREVO_SENDER_EMAIL
            }
        ];

        sendSmtpEmail.htmlContent =
        "<h2>🎉 Brevo is working successfully.</h2>";

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server Running on Port ${PORT}`);
});