using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class donation_allocation
{
    public int allocation_id { get; set; }

    public int donation_id { get; set; }

    public int safehouse_id { get; set; }

    public string? program_area { get; set; }

    public decimal? amount_allocated { get; set; }

    public DateOnly? allocation_date { get; set; }

    public string? allocation_notes { get; set; }

    public virtual donation donation { get; set; } = null!;

    public virtual safehouse safehouse { get; set; } = null!;
}
