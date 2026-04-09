using LuzDeVida.API.Data;
using LuzDeVida.API.Infrastructure;
using LuzDeVida.API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ========== CORS Configuration ==========
const string FrontendCorsPolicy = "FrontendClient";
var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:5173";

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddOpenApi();

// ========== Database Configuration ==========
builder.Services.AddDbContext<LuzDeVidaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ========== ASP.NET Core Identity Configuration ==========
builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<LuzDeVidaDbContext>();

// ========== Password Policy Configuration ==========
// Follows IS414 security requirements for strong passwords
builder.Services.Configure<IdentityOptions>(options =>
{
    // Password complexity requirements
    options.Password.RequireDigit = true;                  // Must contain at least one digit (0-9)
    options.Password.RequireLowercase = true;             // Must contain at least one lowercase (a-z)
    options.Password.RequireNonAlphanumeric = true;        // Must contain special character (!@#$%^&*)
    options.Password.RequireUppercase = true;             // Must contain at least one uppercase (A-Z)
    options.Password.RequiredLength = 12;                 // Minimum 12 characters
    options.Password.RequiredUniqueCharacters = 1;        // Must use unique characters
});

// ========== Cookie Security Configuration ==========
// Implements secure cookie handling for authentication
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;                       // Prevent JavaScript/XSS access
    options.Cookie.SameSite = SameSiteMode.Lax;           // CSRF protection - cookies sent with cross-site requests
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // HTTPS only
    options.ExpireTimeSpan = TimeSpan.FromDays(7);        // Session expires in 7 days
    options.SlidingExpiration = true;                      // Extend expiration on each request
    options.LoginPath = "/api/auth/login";                // Redirect to login on auth failure
    options.LogoutPath = "/api/auth/logout";              // Redirect to logout
    options.AccessDeniedPath = "/api/auth/access-denied"; // Redirect on authorization failure
});

// ========== Application Services ==========
builder.Services.AddScoped<PublicImpactService>();
builder.Services.AddScoped<ReportsService>();

// ========== Authorization Policies ==========
// Define fine-grained authorization policies for business logic
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthPolicies.ManageResidents, 
        policy => policy.RequireRole(AuthRoles.Admin, AuthRoles.CaseWorker));
    
    options.AddPolicy(AuthPolicies.ManageSafehouses, 
        policy => policy.RequireRole(AuthRoles.Admin, AuthRoles.PartnerManager));
    
    options.AddPolicy(AuthPolicies.ManageDonations, 
        policy => policy.RequireRole(AuthRoles.Admin));
    
    options.AddPolicy(AuthPolicies.ViewPublicImpact, 
        policy => policy.AllowAnonymousUser());
    
    options.AddPolicy(AuthPolicies.ManageUsers, 
        policy => policy.RequireRole(AuthRoles.Admin));
    
    options.AddPolicy(AuthPolicies.DeleteData, 
        policy => policy.RequireRole(AuthRoles.Admin));
});

// ========== CORS Configuration with Credentials ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins(frontendUrl)
            .AllowCredentials()              // Allow cookies to be sent with requests
            .AllowAnyMethod()                // Allow all HTTP methods (GET, POST, PUT, DELETE, etc)
            .AllowAnyHeader()                // Allow all headers
            .WithExposedHeaders("Content-Disposition"); // Expose headers for file downloads
    });
});

var app = builder.Build();

// ========== Initialize Default Identity Data ==========
// Creates default roles and admin user on first run
using (var scope = app.Services.CreateScope())
{
    await AuthIdentityGenerator.GenerateDefaultIdentityAsync(scope.ServiceProvider, app.Configuration);
}

// ========== HTTP Request Pipeline Configuration ==========
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
}

// ========== Security Middleware ==========
// Always use HTTPS in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseHsts();
}

// Apply Content-Security-Policy and other security headers
app.UseSecurityHeaders();

// ========== Authentication & Authorization ==========
app.UseCors(FrontendCorsPolicy);
app.UseAuthentication();      // Enable authentication middleware
app.UseAuthorization();       // Enable authorization middleware

// ========== Route Mapping ==========
app.MapControllers();
app.MapIdentityApi<ApplicationUser>(); // Auto-map identity endpoints (/auth/register, /auth/login, etc)

app.Run();
