using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class in_kind_donation_item
{
    public int item_id { get; set; }

    public int donation_id { get; set; }

    public string? item_name { get; set; }

    public string? item_category { get; set; }

    public int? quantity { get; set; }

    public string? unit_of_measure { get; set; }

    public decimal? estimated_unit_value { get; set; }

    public string? intended_use { get; set; }

    public string? received_condition { get; set; }

    public virtual donation donation { get; set; } = null!;
}
