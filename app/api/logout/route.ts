import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const response = NextResponse.redirect(new URL("/login", request.url));
	response.cookies.set("__session", "", {
		maxAge: 0,
		path: "/",
		sameSite: "strict",
		secure: true,
		httpOnly: true,
	});
	return response;
}
