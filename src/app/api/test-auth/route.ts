import { NextResponse } from "next/server";
import { mockUsers } from "@/data/users";
import { verifyPassword } from "@/lib/hash";
import { sanitizeInput } from "@/utils/sanitize";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: "Missing username or password in request body."
      }, { status: 400 });
    }

    // 1. IP and Rate Limit check
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateLimited = isRateLimited(ip);

    // 2. Sanitize
    const sanitizedUsername = sanitizeInput(username.trim());
    
    // 3. Find user
    const user = mockUsers.find(
      (u) => 
        u.username.toLowerCase() === sanitizedUsername.toLowerCase() ||
        (u.registrationNumber && u.registrationNumber.toLowerCase() === sanitizedUsername.toLowerCase())
    );

    if (!user) {
      return NextResponse.json({
        success: false,
        step: "user_lookup",
        rateLimited,
        sanitizedUsername,
        userExists: false,
        error: `User "${sanitizedUsername}" not found in mock database.`
      });
    }

    // 4. Verify password
    let passwordValid = false;
    let passwordError = null;
    try {
      passwordValid = await verifyPassword(password, user.passwordHash);
    } catch (err: any) {
      passwordError = err.message || err.toString();
    }

    return NextResponse.json({
      success: passwordValid,
      step: "password_check",
      rateLimited,
      sanitizedUsername,
      userExists: true,
      userRole: user.role,
      passwordValid,
      passwordError,
      message: passwordValid ? "Authentication successful." : "Password does not match hash."
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      step: "exception",
      error: error.message || error.toString(),
      stack: error.stack
    }, { status: 500 });
  }
}
