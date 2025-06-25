import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, turnstileToken } = await req.json()
    if (!name || !email || !message || !turnstileToken) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    // Verify Turnstile token
    const secretKey = process.env.TURNSTILE_SECRET_KEY
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${turnstileToken}`,
    })
    const verifyData = await verifyRes.json()
    if (!verifyData.success) {
      return NextResponse.json({ error: "CAPTCHA verification failed." }, { status: 400 })
    }

    // Send email (using nodemailer)
    const nodemailer = require("nodemailer")
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    await transporter.sendMail({
      from: `Applyfit Contact <no-reply@applyfit.com>`,
      to: "hello@valentine.dev",
      subject: `Contact Form Submission from ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Contact form error:", err)
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 })
  }
} 