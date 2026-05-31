import { NextRequest, NextResponse } from "next/server";

type RouteHandler = (req: NextRequest, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse>;

export const withErrorHandler = (asyncHandler: RouteHandler): RouteHandler => {
  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    try {
      return await asyncHandler(req, context);
    } catch (error) {
      console.error("API Error caught in wrapper:", error);
      return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
  };
};