using Microsoft.AspNetCore.Mvc;

namespace LuzDeVida.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VersionController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetVersion()
        {
            return Ok(new
            {
                version = "2026-04-09-backend-v10",
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
                machine = Environment.MachineName
            });
        }
    }
}