# Database Schema

Schema definitions are added here as tables are designed. This file is the authoritative source for entity structure, field names, types, constraints, and relationships.

## Agent Rules
- Do not invent fields not defined here
- Do not invent relationships not defined here
- When schema is ambiguous, prefer the most restrictive interpretation and ask before assuming

## Database Architecture
- Operational database and identity/security database may be hosted separately
- Both must be deployed to a real DBMS (Azure SQL, MySQL, or PostgreSQL) — not SQLite

## Domain Overview
Schema covers three domains (see `claude.md` for entity lists):
- **Donor and Support** — safehouses, partners, supporters, donations, allocations
- **Case Management** — residents, process recordings, visitations, education, health, interventions, incidents
- **Outreach and Communication** — social media posts, impact snapshots

---

## Tables

# Database Schema

## Primary Keys

- `app_users`: `user_id` **(PK, IDENTITY)**
- `donation_allocations`: `allocation_id` **(PK)**
- `donations`: `donation_id` **(PK)**
- `education_records`: `education_record_id` **(PK)**
- `health_wellbeing_records`: `health_record_id` **(PK)**
- `home_visitations`: `visitation_id` **(PK)**
- `in_kind_donation_items`: `item_id` **(PK)**
- `incident_reports`: `incident_id` **(PK)**
- `intervention_plans`: `plan_id` **(PK)**
- `partner_assignments`: `assignment_id` **(PK)**
- `partners`: `partner_id` **(PK)**
- `process_recordings`: `recording_id` **(PK)**
- `public_impact_snapshots`: `snapshot_id` **(PK)**
- `residents`: `resident_id` **(PK)**
- `safehouse_monthly_metrics`: `metric_id` **(PK)**
- `safehouses`: `safehouse_id` **(PK)**
- `social_media_posts`: `post_id` **(PK)**
- `supporters`: `supporter_id` **(PK)**

## Foreign Key Relationships

- `donation_allocations.donation_id` → `donations.donation_id`
- `donation_allocations.safehouse_id` → `safehouses.safehouse_id`

- `donations.supporter_id` → `supporters.supporter_id`
- `donations.created_by_partner_id` → `partners.partner_id`
- `donations.referral_post_id` → `social_media_posts.post_id`
- `donations.resident_id` → `residents.resident_id`

- `education_records.resident_id` → `residents.resident_id`

- `health_wellbeing_records.resident_id` → `residents.resident_id`

- `home_visitations.resident_id` → `residents.resident_id`

- `in_kind_donation_items.donation_id` → `donations.donation_id`

- `incident_reports.resident_id` → `residents.resident_id`
- `incident_reports.safehouse_id` → `safehouses.safehouse_id`

- `intervention_plans.resident_id` → `residents.resident_id`

- `partner_assignments.partner_id` → `partners.partner_id`
- `partner_assignments.safehouse_id` → `safehouses.safehouse_id`

- `process_recordings.resident_id` → `residents.resident_id`

- `residents.safehouse_id` → `safehouses.safehouse_id`

- `safehouse_monthly_metrics.safehouse_id` → `safehouses.safehouse_id`

## Table-by-Table Schema

### app_users
- `user_id` (int) **PK, IDENTITY**
- `email` (nvarchar 255) UNIQUE NOT NULL
- `password_hash` (nvarchar 500) NOT NULL
- `role` (nvarchar 50) NOT NULL DEFAULT 'supporter' — values: 'supporter', 'admin'
- `supporter_id` (int) **FK → supporters.supporter_id** — set on self-registration; null for admin accounts
- `is_active` (bit) DEFAULT 1
- `created_at` (datetime) DEFAULT GETUTCDATE()

> Run `docs/migrations/001_create_app_users.sql` before starting the backend.

### donation_allocations
- `allocation_id` (int) **PK**
- `donation_id` (int) **FK → donations.donation_id**
- `safehouse_id` (int) **FK → safehouses.safehouse_id**
- `program_area` (nvarchar)
- `amount_allocated` (decimal)
- `allocation_date` (date)
- `allocation_notes` (nvarchar)

### donations
- `donation_id` (int) **PK**
- `supporter_id` (int) **FK → supporters.supporter_id**
- `resident_id` (int) **FK → residents.resident_id**
- `donation_type` (nvarchar)
- `donation_date` (date)
- `channel_source` (nvarchar)
- `currency_code` (nvarchar)
- `amount` (decimal)
- `estimated_value` (decimal)
- `impact_unit` (nvarchar)
- `is_recurring` (bit)
- `campaign_name` (nvarchar)
- `notes` (nvarchar)
- `created_by_partner_id` (int) **FK → partners.partner_id**
- `referral_post_id` (int) **FK → social_media_posts.post_id**

### education_records
- `education_record_id` (int) **PK**
- `resident_id` (int) **FK → residents.resident_id**
- `record_date` (date)
- `enrollment_status` (nvarchar)
- `school_name` (nvarchar)
- `education_level` (nvarchar)
- `attendance_rate` (decimal)
- `progress_percent` (decimal)
- `completion_status` (nvarchar)
- `notes` (nvarchar)

### health_wellbeing_records
- `health_record_id` (int) **PK**
- `resident_id` (int) **FK → residents.resident_id**
- `record_date` (date)
- `weight_kg` (decimal)
- `height_cm` (decimal)
- `bmi` (decimal)
- `nutrition_score` (decimal)
- `sleep_score` (decimal)
- `energy_score` (decimal)
- `general_health_score` (decimal)
- `medical_checkup_done` (bit)
- `dental_checkup_done` (bit)
- `psychological_checkup_done` (bit)
- `medical_notes_restricted` (nvarchar)

### home_visitations
- `visitation_id` (int) **PK**
- `resident_id` (int) **FK → residents.resident_id**
- `visit_date` (date)
- `social_worker` (nvarchar)
- `visit_type` (nvarchar)
- `location_visited` (nvarchar)
- `family_members_present` (nvarchar)
- `purpose` (nvarchar)
- `observations` (nvarchar)
- `family_cooperation_level` (nvarchar)
- `safety_concerns_noted` (bit)
- `follow_up_needed` (bit)
- `follow_up_notes` (nvarchar)
- `visit_outcome` (nvarchar)

### in_kind_donation_items
- `item_id` (int) **PK**
- `donation_id` (int) **FK → donations.donation_id**
- `item_name` (nvarchar)
- `item_category` (nvarchar)
- `quantity` (int)
- `unit_of_measure` (nvarchar)
- `estimated_unit_value` (decimal)
- `intended_use` (nvarchar)
- `received_condition` (nvarchar)

### incident_reports
- `incident_id` (int) **PK**
- `resident_id` (int) **FK → residents.resident_id**
- `safehouse_id` (int) **FK → safehouses.safehouse_id**
- `incident_date` (date)
- `incident_type` (nvarchar)
- `severity` (nvarchar)
- `description` (nvarchar)
- `response_taken` (nvarchar)
- `resolved` (bit)
- `resolution_date` (date)
- `reported_by` (nvarchar)
- `follow_up_required` (bit)

### intervention_plans
- `plan_id` (int) **PK**
- `resident_id` (int) **FK → residents.resident_id**
- `plan_category` (nvarchar)
- `plan_description` (nvarchar)
- `services_provided` (nvarchar)
- `target_value` (decimal)
- `target_date` (date)
- `status` (nvarchar)
- `case_conference_date` (date)
- `created_at` (datetime)
- `updated_at` (datetime)

### partner_assignments
- `assignment_id` (int) **PK**
- `partner_id` (int) **FK → partners.partner_id**
- `safehouse_id` (int) **FK → safehouses.safehouse_id**
- `program_area` (nvarchar)
- `assignment_start` (date)
- `assignment_end` (date)
- `responsibility_notes` (nvarchar)
- `is_primary` (bit)
- `status` (nvarchar)

### partners
- `partner_id` (int) **PK**
- `partner_name` (nvarchar)
- `partner_type` (nvarchar)
- `role_type` (nvarchar)
- `contact_name` (nvarchar)
- `email` (nvarchar)
- `phone` (nvarchar)
- `region` (nvarchar)
- `status` (nvarchar)
- `start_date` (date)
- `end_date` (date)
- `notes` (nvarchar)

### process_recordings
- `recording_id` (int) **PK**
- `resident_id` (int) **FK → residents.resident_id**
- `session_date` (date)
- `social_worker` (nvarchar)
- `session_type` (nvarchar)
- `session_duration_minutes` (int)
- `emotional_state_observed` (nvarchar)
- `emotional_state_end` (nvarchar)
- `session_narrative` (nvarchar)
- `interventions_applied` (nvarchar)
- `follow_up_actions` (nvarchar)
- `progress_noted` (bit)
- `concerns_flagged` (bit)
- `referral_made` (bit)
- `notes_restricted` (nvarchar)

### public_impact_snapshots
- `snapshot_id` (int) **PK**
- `snapshot_date` (date)
- `headline` (nvarchar)
- `summary_text` (nvarchar)
- `metric_payload_json` (nvarchar)
- `is_published` (bit)
- `published_at` (date)

### residents
- `resident_id` (int) **PK**
- `case_control_no` (nvarchar)
- `internal_code` (nvarchar)
- `safehouse_id` (int) **FK → safehouses.safehouse_id**
- `case_status` (nvarchar)
- `sex` (nvarchar)
- `date_of_birth` (date)
- `birth_status` (nvarchar)
- `place_of_birth` (nvarchar)
- `religion` (nvarchar)
- `case_category` (nvarchar)
- `sub_cat_orphaned` (bit)
- `sub_cat_trafficked` (bit)
- `sub_cat_child_labor` (bit)
- `sub_cat_physical_abuse` (bit)
- `sub_cat_sexual_abuse` (bit)
- `sub_cat_osaec` (bit)
- `sub_cat_cicl` (bit)
- `sub_cat_at_risk` (bit)
- `sub_cat_street_child` (bit)
- `sub_cat_child_with_hiv` (bit)
- `is_pwd` (bit)
- `pwd_type` (nvarchar)
- `has_special_needs` (bit)
- `special_needs_diagnosis` (nvarchar)
- `family_is_4ps` (bit)
- `family_solo_parent` (bit)
- `family_indigenous` (bit)
- `family_parent_pwd` (bit)
- `family_informal_settler` (bit)
- `date_of_admission` (date)
- `age_upon_admission` (nvarchar)
- `present_age` (nvarchar)
- `length_of_stay` (nvarchar)
- `referral_source` (nvarchar)
- `referring_agency_person` (nvarchar)
- `date_colb_registered` (date)
- `date_colb_obtained` (date)
- `assigned_social_worker` (nvarchar)
- `initial_case_assessment` (nvarchar)
- `date_case_study_prepared` (date)
- `reintegration_type` (nvarchar)
- `reintegration_status` (nvarchar)
- `initial_risk_level` (nvarchar)
- `current_risk_level` (nvarchar)
- `date_enrolled` (date)
- `date_closed` (date)
- `created_at` (datetime)
- `notes_restricted` (nvarchar)

### safehouse_monthly_metrics
- `metric_id` (int) **PK**
- `safehouse_id` (int) **FK → safehouses.safehouse_id**
- `month_start` (date)
- `month_end` (date)
- `active_residents` (int)
- `avg_education_progress` (decimal)
- `avg_health_score` (decimal)
- `process_recording_count` (int)
- `home_visitation_count` (int)
- `incident_count` (int)
- `notes` (nvarchar)

### safehouses
- `safehouse_id` (int) **PK**
- `safehouse_code` (nvarchar)
- `name` (nvarchar)
- `region` (nvarchar)
- `city` (nvarchar)
- `province` (nvarchar)
- `country` (nvarchar)
- `open_date` (date)
- `status` (nvarchar)
- `capacity_girls` (int)
- `capacity_staff` (int)
- `current_occupancy` (int)
- `notes` (nvarchar)

### social_media_posts
- `post_id` (int) **PK**
- `platform` (nvarchar)
- `platform_post_id` (nvarchar)
- `post_url` (nvarchar)
- `created_at` (datetime)
- `day_of_week` (nvarchar)
- `post_hour` (int)
- `post_type` (nvarchar)
- `media_type` (nvarchar)
- `caption` (nvarchar)
- `hashtags` (nvarchar)
- `num_hashtags` (int)
- `mentions_count` (int)
- `has_call_to_action` (bit)
- `call_to_action_type` (nvarchar)
- `content_topic` (nvarchar)
- `sentiment_tone` (nvarchar)
- `caption_length` (int)
- `features_resident_story` (bit)
- `campaign_name` (nvarchar)
- `is_boosted` (bit)
- `boost_budget_php` (decimal)
- `impressions` (int)
- `reach` (int)
- `likes` (int)
- `comments` (int)
- `shares` (int)
- `saves` (int)
- `click_throughs` (int)
- `video_views` (int)
- `engagement_rate` (decimal)
- `profile_visits` (int)
- `donation_referrals` (int)
- `estimated_donation_value_php` (decimal)
- `follower_count_at_post` (int)
- `watch_time_seconds` (int)
- `avg_view_duration_seconds` (int)
- `subscriber_count_at_post` (int)
- `forwards` (int)

### supporters
- `supporter_id` (int) **PK**
- `supporter_type` (nvarchar)
- `display_name` (nvarchar)
- `organization_name` (nvarchar)
- `first_name` (nvarchar)
- `last_name` (nvarchar)
- `relationship_type` (nvarchar)
- `region` (nvarchar)
- `country` (nvarchar)
- `email` (nvarchar)
- `phone` (nvarchar)
- `status` (nvarchar)
- `first_donation_date` (date)
- `acquisition_channel` (nvarchar)
- `created_at` (datetime)
