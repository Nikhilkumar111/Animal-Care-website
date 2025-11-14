// netlify/functions/notify-ngo.js
import nodemailer from "nodemailer";
import { data as ngoList } from "./data.js"; // make sure path is correct

export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };

  try {
    const formData = JSON.parse(event.body || "{}");

    if (!formData.animalType) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Animal type is required" }) };
    }

    const nearestNGO = findNearestNGO(formData.postalCode, ngoList);
    if (!nearestNGO) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "No nearby NGO found" }) };
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Missing SMTP credentials" }) };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = `
      <h2>🐾 New Animal Report</h2>
      <p><b>Animal Type:</b> ${formData.animalType}</p>
      <p><b>Description:</b> ${formData.description || "Not provided"}</p>
      <p><b>Address:</b> ${formData.address || "Not provided"}</p>
      <p><b>Postal Code:</b> ${formData.postalCode || "Unknown"}</p>
      ${formData.imageUrl ? `<p><b>Photo:</b><img src="${formData.imageUrl}" width="300"/></p>` : ""}
      <hr>
      <p>Forwarded to: <b>${nearestNGO.name}</b> (${nearestNGO.email})</p>
    `;

    await transporter.sendMail({
      from: `"AnimalCare Alerts" <${process.env.SMTP_USER}>`,
      to: nearestNGO.email,
      subject: `🚨 ${formData.animalType} Report`,
      html,
    });

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: "Email sent!" }) };
  } catch (error) {
    console.error("Error in notify-ngo:", error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Internal Server Error" }) };
  }
}

function findNearestNGO(postal, list) {
  const code = parseInt(postal);
  if (isNaN(code)) return null;
  let nearest = null;
  let minDiff = Infinity;
  for (const ngo of list) {
    const diff = Math.abs(parseInt(ngo.postalCode) - code);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = ngo;
    }
  }
  return nearest;
}
