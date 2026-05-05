// src/app/api/sync-sheets/route.js
import { NextResponse } from "next/server";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyrS3IqXCBA73p5Q0cBfo_ltaS8F7aYkZNqOpuemLx0SIMEvEqY0KnFi0cSTIlSqvONGQ/exec";

export async function POST(request) {
  try {
    const payload = await request.json();

    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Proxy sync error:", err);
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}