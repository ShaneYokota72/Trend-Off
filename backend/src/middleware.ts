import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// the list of all allowed origins
const allowedOrigins = [
  'http://localhost:9001', 
  // '', -> add shop deployed frontend URL here
];

export function middleware(req: NextRequest) {
    if (process.env.NODE_ENV === "development") {
      console.log("=== MIDDLEWARE TRIGGERED ===");
      console.log("URL:", req.url);
      console.log("Method:", req.method);
      console.log("Pathname:", req.nextUrl.pathname);
      console.log("Origin:", req.headers.get("origin"));
      console.log("================================");
    }

    const origin = req.headers.get("origin") || ""

    const res = NextResponse.next()
    if (allowedOrigins.includes(origin)) {
      res.headers.append('Access-Control-Allow-Origin', origin);
    }
    res.headers.append('Access-Control-Allow-Credentials', "true")
    res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
    res.headers.append(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    return res
}

// specify the path regex to apply the middleware to
export const config = {
    matcher: [
      '/api/:path*',
    ]
}