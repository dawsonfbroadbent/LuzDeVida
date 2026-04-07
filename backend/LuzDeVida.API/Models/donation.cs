using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class donation
{
    public int donation_id { get; set; }

    public int supporter_id { get; set; }

    public string? donation_type { get; set; }

    public DateOnly? donation_date { get; set; }

    public string? channel_source { get; set; }

    public string? currency_code { get; set; }

    public decimal? amount { get; set; }

    public decimal? estimated_value { get; set; }

    public string? impact_unit { get; set; }

    public bool? is_recurring { get; set; }

    public string? campaign_name { get; set; }

    public string? notes { get; set; }

    public int? created_by_partner_id { get; set; }

    public int? referral_post_id { get; set; }

    public virtual partner? created_by_partner { get; set; }

    public virtual ICollection<donation_allocation> donation_allocations { get; set; } = new List<donation_allocation>();

    public virtual ICollection<in_kind_donation_item> in_kind_donation_items { get; set; } = new List<in_kind_donation_item>();

    public virtual social_media_post? referral_post { get; set; }

    public virtual supporter supporter { get; set; } = null!;
}
