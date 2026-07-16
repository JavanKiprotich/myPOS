import crypto from "crypto";

const BASE_URL =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");


  sendStkPush(phone, amount)

  const response = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get M-Pesa access token.");
  }

  const data = await response.json();

  return data.access_token;
}

export function generateTimestamp() {
  const now = new Date();

  const pad = (n) => String(n).padStart(2, "0");

  return (
    now.getFullYear() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

export function generatePassword() {
  const timestamp = generateTimestamp();

  const password = Buffer.from(
    process.env.MPESA_SHORTCODE +
      process.env.MPESA_PASSKEY +
      timestamp
  ).toString("base64");

  return {
    password,
    timestamp,
  };
}