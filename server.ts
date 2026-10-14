import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import nodemailer from "nodemailer";

const app = express();
const PORT = 3000;

// Configure multer for handling file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

// API route for handling the contact form submission
app.post("/api/contact", upload.array("attachments"), async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const files = req.files as Express.Multer.File[];

    // In a real app, you would configure this with actual SMTP credentials.
    // For now, we will guide the user on how to set this up via environment variables.
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.example.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "user@example.com",
        pass: process.env.SMTP_PASS || "password",
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER || "user@example.com",
      to: process.env.CONTACT_EMAIL || "recipient@example.com",
      subject: `New Commission Request from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      attachments: files ? files.map(file => ({
        filename: file.originalname,
        content: file.buffer
      })) : []
    };

    // If no real credentials are set, this will likely fail, so we catch the error 
    // and log it, returning a "success" (or specific message) for preview purposes.
    if (!process.env.SMTP_HOST) {
      console.warn("SMTP_HOST not set. Mocking email sending.");
      return res.status(200).json({ success: true, message: "Mock email sent successfully (Configure SMTP credentials in Settings)." });
    }

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: "Failed to send email." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
