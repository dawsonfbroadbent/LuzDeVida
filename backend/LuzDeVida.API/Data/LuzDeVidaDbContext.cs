using System;
using System.Collections.Generic;
using LuzDeVida.API.Models;
using Microsoft.EntityFrameworkCore;

namespace LuzDeVida.API.Data;

public partial class LuzDeVidaDbContext : DbContext
{
    public LuzDeVidaDbContext(DbContextOptions<LuzDeVidaDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<app_user> app_users { get; set; }

    public virtual DbSet<donation> donations { get; set; }

    public virtual DbSet<donation_allocation> donation_allocations { get; set; }

    public virtual DbSet<education_record> education_records { get; set; }

    public virtual DbSet<health_wellbeing_record> health_wellbeing_records { get; set; }

    public virtual DbSet<home_visitation> home_visitations { get; set; }

    public virtual DbSet<in_kind_donation_item> in_kind_donation_items { get; set; }

    public virtual DbSet<incident_report> incident_reports { get; set; }

    public virtual DbSet<intervention_plan> intervention_plans { get; set; }

    public virtual DbSet<partner> partners { get; set; }

    public virtual DbSet<partner_assignment> partner_assignments { get; set; }

    public virtual DbSet<process_recording> process_recordings { get; set; }

    public virtual DbSet<public_impact_snapshot> public_impact_snapshots { get; set; }

    public virtual DbSet<resident> residents { get; set; }

    public virtual DbSet<safehouse> safehouses { get; set; }

    public virtual DbSet<safehouse_monthly_metric> safehouse_monthly_metrics { get; set; }

    public virtual DbSet<social_media_post> social_media_posts { get; set; }

    public virtual DbSet<supporter> supporters { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<app_user>(entity =>
        {
            entity.HasKey(e => e.user_id);

            entity.ToTable("app_users");

            entity.HasIndex(e => e.email).IsUnique();

            entity.Property(e => e.user_id).ValueGeneratedOnAdd();
            entity.Property(e => e.email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.password_hash).HasMaxLength(500).IsRequired();
            entity.Property(e => e.role).HasMaxLength(50).HasDefaultValue("supporter");
            entity.Property(e => e.is_active).HasDefaultValue(true);
            entity.Property(e => e.created_at).HasColumnType("datetime");

            entity.HasOne(e => e.supporter)
                .WithMany()
                .HasForeignKey(e => e.supporter_id)
                .HasConstraintName("FK_app_users_supporters");
        });

        modelBuilder.Entity<donation>(entity =>
        {
            entity.HasKey(e => e.donation_id).HasName("PK__donation__296B91DC41AB1A05");

            entity.Property(e => e.donation_id).ValueGeneratedNever();
            entity.Property(e => e.amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.campaign_name).HasMaxLength(255);
            entity.Property(e => e.channel_source).HasMaxLength(100);
            entity.Property(e => e.currency_code).HasMaxLength(10);
            entity.Property(e => e.donation_type).HasMaxLength(50);
            entity.Property(e => e.estimated_value).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.impact_unit).HasMaxLength(50);

            entity.HasOne(d => d.created_by_partner).WithMany(p => p.donations)
                .HasForeignKey(d => d.created_by_partner_id)
                .HasConstraintName("FK_donations_partners");

            entity.HasOne(d => d.referral_post).WithMany(p => p.donations)
                .HasForeignKey(d => d.referral_post_id)
                .HasConstraintName("FK_donations_posts");

            entity.HasOne(d => d.supporter).WithMany(p => p.donations)
                .HasForeignKey(d => d.supporter_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_donations_supporters");
        });

        modelBuilder.Entity<donation_allocation>(entity =>
        {
            entity.HasKey(e => e.allocation_id).HasName("PK__donation__5DFAFF3028F97333");

            entity.Property(e => e.allocation_id).ValueGeneratedNever();
            entity.Property(e => e.amount_allocated).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.program_area).HasMaxLength(100);

            entity.HasOne(d => d.donation).WithMany(p => p.donation_allocations)
                .HasForeignKey(d => d.donation_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_donation_allocations_donations");

            entity.HasOne(d => d.safehouse).WithMany(p => p.donation_allocations)
                .HasForeignKey(d => d.safehouse_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_donation_allocations_safehouses");
        });

        modelBuilder.Entity<education_record>(entity =>
        {
            entity.HasKey(e => e.education_record_id).HasName("PK__educatio__EA4B1D8F82E6ABAD");

            entity.Property(e => e.education_record_id).ValueGeneratedNever();
            entity.Property(e => e.attendance_rate).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.completion_status).HasMaxLength(50);
            entity.Property(e => e.education_level).HasMaxLength(100);
            entity.Property(e => e.enrollment_status).HasMaxLength(100);
            entity.Property(e => e.progress_percent).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.school_name).HasMaxLength(100);

            entity.HasOne(d => d.resident).WithMany(p => p.education_records)
                .HasForeignKey(d => d.resident_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_education_records_residents");
        });

        modelBuilder.Entity<health_wellbeing_record>(entity =>
        {
            entity.HasKey(e => e.health_record_id).HasName("PK__health_w__B1EEFD8F721197C7");

            entity.Property(e => e.health_record_id).ValueGeneratedNever();
            entity.Property(e => e.bmi).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.energy_score).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.general_health_score).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.height_cm).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.nutrition_score).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.sleep_score).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.weight_kg).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.resident).WithMany(p => p.health_wellbeing_records)
                .HasForeignKey(d => d.resident_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_health_wellbeing_records_residents");
        });

        modelBuilder.Entity<home_visitation>(entity =>
        {
            entity.HasKey(e => e.visitation_id).HasName("PK__home_vis__9F102772DCCE8D22");

            entity.Property(e => e.visitation_id).ValueGeneratedNever();
            entity.Property(e => e.family_cooperation_level).HasMaxLength(100);
            entity.Property(e => e.family_members_present).HasMaxLength(255);
            entity.Property(e => e.location_visited).HasMaxLength(255);
            entity.Property(e => e.social_worker).HasMaxLength(255);
            entity.Property(e => e.visit_outcome).HasMaxLength(100);
            entity.Property(e => e.visit_type).HasMaxLength(100);

            entity.HasOne(d => d.resident).WithMany(p => p.home_visitations)
                .HasForeignKey(d => d.resident_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .IsRequired(false)
                .HasConstraintName("FK_home_visitations_residents");
        });

        modelBuilder.Entity<in_kind_donation_item>(entity =>
        {
            entity.HasKey(e => e.item_id).HasName("PK__in_kind___52020FDDBBF3F9C3");

            entity.Property(e => e.item_id).ValueGeneratedNever();
            entity.Property(e => e.estimated_unit_value).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.intended_use).HasMaxLength(100);
            entity.Property(e => e.item_category).HasMaxLength(100);
            entity.Property(e => e.item_name).HasMaxLength(255);
            entity.Property(e => e.received_condition).HasMaxLength(50);
            entity.Property(e => e.unit_of_measure).HasMaxLength(50);

            entity.HasOne(d => d.donation).WithMany(p => p.in_kind_donation_items)
                .HasForeignKey(d => d.donation_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_in_kind_donation_items_donations");
        });

        modelBuilder.Entity<incident_report>(entity =>
        {
            entity.HasKey(e => e.incident_id).HasName("PK__incident__E6C40DA3BE4EC75C");

            entity.Property(e => e.incident_id).ValueGeneratedNever();
            entity.Property(e => e.incident_type).HasMaxLength(100);
            entity.Property(e => e.reported_by).HasMaxLength(255);
            entity.Property(e => e.severity).HasMaxLength(50);

            entity.HasOne(d => d.resident).WithMany(p => p.incident_reports)
                .HasForeignKey(d => d.resident_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_incident_reports_residents");

            entity.HasOne(d => d.safehouse).WithMany(p => p.incident_reports)
                .HasForeignKey(d => d.safehouse_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_incident_reports_safehouses");
        });

        modelBuilder.Entity<intervention_plan>(entity =>
        {
            entity.HasKey(e => e.plan_id).HasName("PK__interven__BE9F8F1D22BEEAA3");

            entity.Property(e => e.plan_id).ValueGeneratedNever();
            entity.Property(e => e.created_at).HasColumnType("datetime");
            entity.Property(e => e.plan_category).HasMaxLength(100);
            entity.Property(e => e.services_provided).HasMaxLength(255);
            entity.Property(e => e.status).HasMaxLength(50);
            entity.Property(e => e.target_value).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.updated_at).HasColumnType("datetime");

            entity.HasOne(d => d.resident).WithMany(p => p.intervention_plans)
                .HasForeignKey(d => d.resident_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .IsRequired(false)
                .HasConstraintName("FK_intervention_plans_residents");
        });

        modelBuilder.Entity<partner>(entity =>
        {
            entity.HasKey(e => e.partner_id).HasName("PK__partners__576F1B2759405C10");

            entity.Property(e => e.partner_id).ValueGeneratedNever();
            entity.Property(e => e.contact_name).HasMaxLength(255);
            entity.Property(e => e.email).HasMaxLength(255);
            entity.Property(e => e.partner_name).HasMaxLength(255);
            entity.Property(e => e.partner_type).HasMaxLength(100);
            entity.Property(e => e.phone).HasMaxLength(50);
            entity.Property(e => e.region).HasMaxLength(100);
            entity.Property(e => e.role_type).HasMaxLength(100);
            entity.Property(e => e.status).HasMaxLength(50);
        });

        modelBuilder.Entity<partner_assignment>(entity =>
        {
            entity.HasKey(e => e.assignment_id).HasName("PK__partner___DA891814B1C85E0B");

            entity.Property(e => e.assignment_id).ValueGeneratedNever();
            entity.Property(e => e.program_area).HasMaxLength(100);
            entity.Property(e => e.status).HasMaxLength(50);

            entity.HasOne(d => d.partner).WithMany(p => p.partner_assignments)
                .HasForeignKey(d => d.partner_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_partner_assignments_partners");

            entity.HasOne(d => d.safehouse).WithMany(p => p.partner_assignments)
                .HasForeignKey(d => d.safehouse_id)
                .HasConstraintName("FK_partner_assignments_safehouses");
        });

        modelBuilder.Entity<process_recording>(entity =>
        {
            entity.HasKey(e => e.recording_id).HasName("PK__process___0C5B24E57E347821");

            entity.Property(e => e.recording_id).ValueGeneratedNever();
            entity.Property(e => e.emotional_state_end).HasMaxLength(50);
            entity.Property(e => e.emotional_state_observed).HasMaxLength(50);
            entity.Property(e => e.session_type).HasMaxLength(50);
            entity.Property(e => e.social_worker).HasMaxLength(255);

            entity.HasOne(d => d.resident).WithMany(p => p.process_recordings)
                .HasForeignKey(d => d.resident_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_process_recordings_residents");
        });

        modelBuilder.Entity<public_impact_snapshot>(entity =>
        {
            entity.HasKey(e => e.snapshot_id).HasName("PK__public_i__C27CFBF76A2A959C");

            entity.Property(e => e.snapshot_id).ValueGeneratedNever();
            entity.Property(e => e.headline).HasMaxLength(255);
        });

        modelBuilder.Entity<resident>(entity =>
        {
            entity.HasKey(e => e.resident_id).HasName("PK__resident__A5BC2ECE00C9312B");

            entity.Property(e => e.resident_id).ValueGeneratedNever();
            entity.Property(e => e.age_upon_admission).HasMaxLength(100);
            entity.Property(e => e.assigned_social_worker).HasMaxLength(255);
            entity.Property(e => e.birth_status).HasMaxLength(50);
            entity.Property(e => e.case_category).HasMaxLength(100);
            entity.Property(e => e.case_control_no).HasMaxLength(50);
            entity.Property(e => e.case_status).HasMaxLength(50);
            entity.Property(e => e.created_at).HasColumnType("datetime");
            entity.Property(e => e.current_risk_level).HasMaxLength(50);
            entity.Property(e => e.initial_case_assessment).HasMaxLength(255);
            entity.Property(e => e.initial_risk_level).HasMaxLength(50);
            entity.Property(e => e.internal_code).HasMaxLength(50);
            entity.Property(e => e.length_of_stay).HasMaxLength(100);
            entity.Property(e => e.place_of_birth).HasMaxLength(255);
            entity.Property(e => e.present_age).HasMaxLength(100);
            entity.Property(e => e.pwd_type).HasMaxLength(255);
            entity.Property(e => e.referral_source).HasMaxLength(100);
            entity.Property(e => e.referring_agency_person).HasMaxLength(255);
            entity.Property(e => e.reintegration_status).HasMaxLength(100);
            entity.Property(e => e.reintegration_type).HasMaxLength(100);
            entity.Property(e => e.religion).HasMaxLength(100);
            entity.Property(e => e.sex).HasMaxLength(10);
            entity.Property(e => e.special_needs_diagnosis).HasMaxLength(255);

            entity.HasOne(d => d.safehouse).WithMany(p => p.residents)
                .HasForeignKey(d => d.safehouse_id)
                .HasConstraintName("FK_residents_safehouses");
        });

        modelBuilder.Entity<safehouse>(entity =>
        {
            entity.HasKey(e => e.safehouse_id).HasName("PK__safehous__BC4083B50113B168");

            entity.Property(e => e.safehouse_id).ValueGeneratedNever();
            entity.Property(e => e.city).HasMaxLength(100);
            entity.Property(e => e.country)
                .HasMaxLength(100)
                .HasDefaultValue("Costa Rica");
            entity.Property(e => e.name).HasMaxLength(255);
            entity.Property(e => e.province).HasMaxLength(100);
            entity.Property(e => e.region).HasMaxLength(100);
            entity.Property(e => e.safehouse_code).HasMaxLength(50);
            entity.Property(e => e.status).HasMaxLength(50);
        });

        modelBuilder.Entity<safehouse_monthly_metric>(entity =>
        {
            entity.HasKey(e => e.metric_id).HasName("PK__safehous__13D5DCA4E595EFAB");

            entity.Property(e => e.metric_id).ValueGeneratedNever();
            entity.Property(e => e.avg_education_progress).HasColumnType("decimal(5, 2)");
            entity.Property(e => e.avg_health_score).HasColumnType("decimal(5, 2)");

            entity.HasOne(d => d.safehouse).WithMany(p => p.safehouse_monthly_metrics)
                .HasForeignKey(d => d.safehouse_id)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_safehouse_monthly_metrics_safehouses");
        });

        modelBuilder.Entity<social_media_post>(entity =>
        {
            entity.HasKey(e => e.post_id).HasName("PK__social_m__3ED78766F2DFD312");

            entity.Property(e => e.post_id).ValueGeneratedNever();
            entity.Property(e => e.boost_budget_php).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.call_to_action_type).HasMaxLength(100);
            entity.Property(e => e.campaign_name).HasMaxLength(255);
            entity.Property(e => e.content_topic).HasMaxLength(100);
            entity.Property(e => e.created_at).HasColumnType("datetime");
            entity.Property(e => e.day_of_week).HasMaxLength(50);
            entity.Property(e => e.engagement_rate).HasColumnType("decimal(10, 4)");
            entity.Property(e => e.estimated_donation_value_php).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.media_type).HasMaxLength(50);
            entity.Property(e => e.platform).HasMaxLength(50);
            entity.Property(e => e.platform_post_id).HasMaxLength(100);
            entity.Property(e => e.post_type).HasMaxLength(100);
            entity.Property(e => e.post_url).HasMaxLength(500);
            entity.Property(e => e.sentiment_tone).HasMaxLength(100);
        });

        modelBuilder.Entity<supporter>(entity =>
        {
            entity.HasKey(e => e.supporter_id).HasName("PK__supporte__F3A5770107B35CDA");

            entity.Property(e => e.supporter_id).ValueGeneratedNever();
            entity.Property(e => e.acquisition_channel).HasMaxLength(100);
            entity.Property(e => e.country).HasMaxLength(100);
            entity.Property(e => e.created_at).HasColumnType("datetime");
            entity.Property(e => e.display_name).HasMaxLength(255);
            entity.Property(e => e.email).HasMaxLength(255);
            entity.Property(e => e.first_name).HasMaxLength(100);
            entity.Property(e => e.last_name).HasMaxLength(100);
            entity.Property(e => e.organization_name).HasMaxLength(255);
            entity.Property(e => e.phone).HasMaxLength(50);
            entity.Property(e => e.region).HasMaxLength(100);
            entity.Property(e => e.relationship_type).HasMaxLength(100);
            entity.Property(e => e.status).HasMaxLength(50);
            entity.Property(e => e.supporter_type).HasMaxLength(100);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
