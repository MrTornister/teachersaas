import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/((?!sign-in|sign-up).*)' // Basic protection, adjust as needed or use specific routes
]);

export default clerkMiddleware(async (auth, req) => {
    // if (isProtectedRoute(req)) await auth.protect(); // Uncomment to enforce auth
    // For now we just return intlMiddleware which handles the response

    return intlMiddleware(req);
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
