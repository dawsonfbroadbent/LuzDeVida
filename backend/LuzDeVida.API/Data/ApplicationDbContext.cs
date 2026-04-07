using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using LuzDeVida.API.Models.Domain;
using LuzDeVida.API.Models.Identity;

namespace LuzDeVida.API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Domain Entities
    public DbSet<Safehouse> Safehouses { get; set; }
    public DbSet<Resident> Residents { get; set; }
    public DbSet<Supporter> Supporters { get; set; }
    public DbSet<Donation> Donations { get; set; }
    public DbSet<ProcessRecording> ProcessRecordings { get; set; }
    public DbSet<HomeVisitation> HomeVisitations { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.ConfigureWarnings(w =>
            w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)
        );
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Entity Keys and Relationships
        modelBuilder.Entity<Safehouse>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Region).IsRequired().HasMaxLength(50);
            entity.Property(e => e.City).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Province).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Status).HasDefaultValue("Active");
        });

        modelBuilder.Entity<Resident>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CaseControlNo).IsRequired().HasMaxLength(20);
            entity.Property(e => e.InternalCode).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Sex).IsRequired().HasDefaultValue("F");
            entity.Property(e => e.CaseStatus).HasDefaultValue("Active");
            entity.Property(e => e.InitialRiskLevel).HasDefaultValue("Low");
            entity.Property(e => e.CurrentRiskLevel).HasDefaultValue("Low");
            
            entity.HasOne(e => e.Safehouse)
                .WithMany()
                .HasForeignKey(e => e.SafehouseId)
                .OnDelete(DeleteBehavior.Restrict);

            // Create indexes for filtering
            entity.HasIndex(e => e.SafehouseId);
            entity.HasIndex(e => e.CaseStatus);
            entity.HasIndex(e => e.CurrentRiskLevel);
            entity.HasIndex(e => e.DateOfBirth);
        });

        modelBuilder.Entity<Supporter>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DisplayName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.SupporterType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Status).HasDefaultValue("Active");
            
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.SupporterType);
            entity.HasIndex(e => e.Status);
        });

        modelBuilder.Entity<Donation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DonationType).IsRequired();
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.EstimatedValue).HasPrecision(18, 2);
            entity.Property(e => e.CurrencyCode).HasDefaultValue("PHP");
            
            entity.HasOne(e => e.Supporter)
                .WithMany()
                .HasForeignKey(e => e.SupporterId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.SupporterId);
            entity.HasIndex(e => e.DonationDate);
            entity.HasIndex(e => e.DonationType);
        });

        modelBuilder.Entity<ProcessRecording>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SessionNarrative).IsRequired();
            entity.Property(e => e.SocialWorker).IsRequired();
            
            entity.HasOne(e => e.Resident)
                .WithMany()
                .HasForeignKey(e => e.ResidentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ResidentId);
            entity.HasIndex(e => e.SessionDate);
        });

        modelBuilder.Entity<HomeVisitation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Observations).IsRequired();
            entity.Property(e => e.SocialWorker).IsRequired();
            
            entity.HasOne(e => e.Resident)
                .WithMany()
                .HasForeignKey(e => e.ResidentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ResidentId);
            entity.HasIndex(e => e.VisitDate);
        });

        // Identity Configuration
        modelBuilder.Entity<ApplicationRole>(entity =>
        {
            entity.HasData(
                new ApplicationRole { Id = new Guid("11111111-1111-1111-1111-111111111111"), Name = "Admin", NormalizedName = "ADMIN", Description = "Administrator" },
                new ApplicationRole { Id = new Guid("22222222-2222-2222-2222-222222222222"), Name = "Staff", NormalizedName = "STAFF", Description = "Staff Member" },
                new ApplicationRole { Id = new Guid("33333333-3333-3333-3333-333333333333"), Name = "Donor", NormalizedName = "DONOR", Description = "Donor/Supporter" }
            );
        });
    }
}
