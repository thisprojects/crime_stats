import { NominatimResult, PostcodeResponse } from "@/types/GeoCode/geoCode";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit window
    rateLimiter.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

function isValidPostcode(postcode: string): boolean {
  // Basic UK postcode validation
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
  return ukPostcodeRegex.test(postcode.replace(/\s/g, ""));
}

export async function GET(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    // Get postcode from query params
    const { searchParams } = new URL(request.url);
    const postcode = searchParams.get("postcode");

    if (!postcode) {
      return NextResponse.json(
        { error: "Postcode parameter is required" },
        { status: 400 }
      );
    }

    // Validate postcode format
    if (!isValidPostcode(postcode)) {
      return NextResponse.json(
        { error: "Invalid postcode format" },
        { status: 400 }
      );
    }

    // Prepare Nominatim request
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      postcode
    )}&format=json&countrycodes=gb&limit=1`;

    // Make request to Nominatim with proper headers
    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "PostcodeGeocoder/1.0 (npmnorbert@gmail.com)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data: NominatimResult[] = await response.json();

    if (data.length === 0) {
      return NextResponse.json(
        { error: "Postcode not found" },
        { status: 404 }
      );
    }

    const result = data[0];
    const geocodeResult: PostcodeResponse = {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      display_name: result.display_name,
    };

    return NextResponse.json(geocodeResult);
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
