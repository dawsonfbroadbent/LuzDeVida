using System;
using System.Collections.Generic;

namespace LuzDeVida.API.Models;

public partial class partner_assignment
{
    public int assignment_id { get; set; }

    public int partner_id { get; set; }

    public int? safehouse_id { get; set; }

    public string? program_area { get; set; }

    public DateOnly? assignment_start { get; set; }

    public DateOnly? assignment_end { get; set; }

    public string? responsibility_notes { get; set; }

    public bool? is_primary { get; set; }

    public string? status { get; set; }

    public virtual partner partner { get; set; } = null!;

    public virtual safehouse? safehouse { get; set; }
}
