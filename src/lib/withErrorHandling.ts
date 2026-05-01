import { type NextResponse } from "next/server";
import { handleError } from "@/lib/errorHandler";

type RouteHandler = (request: Request) => Promise<Response | NextResponse>;

export function withErrorHandling(handler: RouteHandler): RouteHandler {
  return async (request: Request) => {
    try {
      return await handler(request);
    } catch (error) {
      return handleError(error);
    }
  };
}
