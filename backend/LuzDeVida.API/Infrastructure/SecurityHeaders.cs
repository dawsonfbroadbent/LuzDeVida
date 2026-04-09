namespace LuzDeVida.API.Infrastructure;

/// <summary>
/// Security headers middleware for LuzDeVida API.
/// Adds security-related HTTP headers to all responses to protect against common web attacks.
/// </summary>
public static class SecurityHeaders
{
    /// <summary>
    /// Content-Security-Policy header value.
    /// Prevents inline scripts (XSS), restricts script sources to same-origin only.
    /// blocks framing attacks and disables plug-in execution.
    /// </summary>
    public const string ContentSecurityPolicy = 
        "default-src 'self'; " +                    // All content from same origin only
        "script-src 'self'; " +                     // Only same-origin scripts (no inline)
        "style-src 'self' 'unsafe-inline'; " +      // Styles from same-origin + inline (CSS needed)
        "img-src 'self' data: https:; " +           // Images from same-origin, data URIs, https
        "font-src 'self'; " +                       // Fonts from same-origin only
        "connect-src 'self'; " +                    // API calls to same-origin only
        "frame-ancestors 'none'; " +                // Cannot be framed (clickjacking protection)
        "base-uri 'self'; " +                       // Base URL restricted to same-origin
        "form-action 'self'; " +                    // Form submissions to same-origin only
        "object-src 'none'; " +                     // Disables plugins (Flash, etc)
        "upgrade-insecure-requests";                // Upgrades HTTP to HTTPS if possible

    /// <summary>
    /// Adds security headers to all HTTP responses.
    /// Applies Content-Security-Policy and other protective headers.
    /// Headers are applied before response starts being sent to client.
    /// </summary>
    /// <param name="app">IApplicationBuilder to add middleware to</param>
    /// <returns>Modified IApplicationBuilder</returns>
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        var environment = app.ApplicationServices.GetRequiredService<IWebHostEnvironment>();
        
        return app.Use(async (context, next) =>
        {
            context.Response.OnStarting(() =>
            {
                // Add CSP header to all responses except development Swagger UI
                if (!(environment.IsDevelopment() && context.Request.Path.StartsWithSegments("/swagger")))
                {
                    context.Response.Headers["Content-Security-Policy"] = ContentSecurityPolicy;
                }

                // Add additional security headers to all responses
                context.Response.Headers["X-Content-Type-Options"] = "nosniff";                  // Prevents MIME type sniffing
                context.Response.Headers["X-Frame-Options"] = "DENY";                           // Prevents clickjacking (do not allow framing)
                context.Response.Headers["X-XSS-Protection"] = "1; mode=block";                 // XSS filter - block page if attack detected
                context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin"; // Control referrer information
                context.Response.Headers["Permissions-Policy"] = "microphone=(), camera=()";    // Deny access to sensitive APIs

                return Task.CompletedTask;
            });

            await next();
        });
    }
}
