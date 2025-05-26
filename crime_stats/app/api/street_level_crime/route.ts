// pages/api/crimes.ts (or app/api/crimes/route.ts for App Router)

import { NextRequest, NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
import { ApiErrorResponse, CrimeApiResponse } from "@/types/Crime/crime";

const rateLimitStore = new Map<string, number[]>();

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
} as const;

interface RateLimitResult {
  isLimited: boolean;
  remaining: number;
  resetTime: Date;
}

function getRateLimitKey(ip: string): string {
  return `rate_limit:${ip}`;
}

function checkRateLimit(ip: string): RateLimitResult {
  const key = getRateLimitKey(ip);
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.windowMs;

  // Get existing requests for this IP
  const requests = rateLimitStore.get(key) || [];

  // Filter out requests outside the current window
  const validRequests = requests.filter((timestamp) => timestamp > windowStart);

  const remaining = Math.max(0, RATE_LIMIT.maxRequests - validRequests.length);
  const resetTime = new Date(now + RATE_LIMIT.windowMs);

  // Check if limit exceeded
  if (validRequests.length >= RATE_LIMIT.maxRequests) {
    return {
      isLimited: true,
      remaining: 0,
      resetTime,
    };
  }

  // Add current request and update store
  validRequests.push(now);
  rateLimitStore.set(key, validRequests);

  return {
    isLimited: false,
    remaining: remaining - 1, // Subtract 1 for current request
    resetTime,
  };
}

function getClientIP(request: NextRequest): string {
  // Try various headers for getting the real IP
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback for development
  return "127.0.0.1";
}

function validateDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}$/;
  return dateRegex.test(date);
}

function validateCoordinates(
  lat: string,
  lng: string
): {
  isValid: boolean;
  latitude?: number;
  longitude?: number;
  error?: string;
} {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude)) {
    return {
      isValid: false,
      error: "Invalid coordinates. Lat and lng must be valid numbers",
    };
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return {
      isValid: false,
      error: "Coordinates out of range",
    };
  }

  return {
    isValid: true,
    latitude,
    longitude,
  };
}

// For App Router (app/api/crimes/route.ts)
export async function GET(
  request: NextRequest
): Promise<NextResponse<CrimeApiResponse | ApiErrorResponse>> {
  try {
    // Get client IP and check rate limit
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP);

    if (rateLimitResult.isLimited) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil(RATE_LIMIT.windowMs / 1000),
        },
        {
          status: 429,
        }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    // Validate required parameters
    if (!date || !lat || !lng) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "Missing required parameters: date, lat, lng" },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM)
    if (!validateDateFormat(date)) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "Invalid date format. Use YYYY-MM (e.g., 2024-01)" },
        { status: 400 }
      );
    }

    // Validate coordinates
    const coordinateValidation = validateCoordinates(lat, lng);
    if (!coordinateValidation.isValid) {
      return NextResponse.json<ApiErrorResponse>(
        { error: coordinateValidation.error! },
        { status: 400 }
      );
    }

    // Build the API URL
    const apiUrl = `https://data.police.uk/api/crimes-street/all-crime?date=${encodeURIComponent(
      date
    )}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;

    // Fetch data from the police API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json<ApiErrorResponse>(
          { error: "No data found for the specified location and date" },
          { status: 404 }
        );
      }

      throw new Error(`Police API responded with status: ${response.status}`);
    }

    const data: CrimeApiResponse = await response.json();

    return NextResponse.json<CrimeApiResponse>(data);
  } catch (error) {
    console.error("Crime API Error:", error);

    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to fetch crime data. Please try again later." },
      { status: 500 }
    );
  }
}

// For Pages Router (pages/api/crimes.ts)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CrimeApiResponse | ApiErrorResponse>
): Promise<void> {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get client IP and check rate limit
    const clientIP = req.socket.remoteAddress as string;
    const rateLimitResult = checkRateLimit(clientIP);

    if (rateLimitResult.isLimited) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(RATE_LIMIT.windowMs / 1000),
      });
    }

    const { date, lat, lng } = req.query;

    // Type guard for query parameters
    if (
      typeof date !== "string" ||
      typeof lat !== "string" ||
      typeof lng !== "string"
    ) {
      return res.status(400).json({
        error: "Missing required parameters: date, lat, lng",
      });
    }

    // Validate date format (YYYY-MM)
    if (!validateDateFormat(date)) {
      return res.status(400).json({
        error: "Invalid date format. Use YYYY-MM (e.g., 2024-01)",
      });
    }

    // Validate coordinates
    const coordinateValidation = validateCoordinates(lat, lng);
    if (!coordinateValidation.isValid) {
      return res.status(400).json({
        error: coordinateValidation.error!,
      });
    }

    // Build the API URL
    const apiUrl = `https://data.police.uk/api/crimes-street/all-crime?date=${encodeURIComponent(
      date
    )}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;

    // Fetch data from the police API
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Next.js Crime Data App",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({
          error: "No data found for the specified location and date",
        });
      }

      throw new Error(`Police API responded with status: ${response.status}`);
    }

    const data: CrimeApiResponse = await response.json();

    res.status(200).json(data);
  } catch (error) {
    console.error("Crime API Error:", error);
    res.status(500).json({
      error: "Failed to fetch crime data. Please try again later.",
    });
  }
}
