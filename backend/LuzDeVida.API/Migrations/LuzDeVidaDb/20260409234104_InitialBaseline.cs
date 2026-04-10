using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LuzDeVida.API.Migrations.LuzDeVidaDb
{
    /// <inheritdoc />
    public partial class InitialBaseline : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Intentionally empty — existing tables were created outside EF Core.
            // The prediction tables (ml_*) already exist from a prior manual run.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
        }
    }
}
