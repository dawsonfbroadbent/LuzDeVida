using System;

namespace LuzDeVida.API.Models;

public partial class app_user
{
    public int user_id { get; set; }

    public string email { get; set; } = null!;

    public string password_hash { get; set; } = null!;

    public string role { get; set; } = "supporter";

    public int? supporter_id { get; set; }

    public bool is_active { get; set; } = true;

    public DateTime created_at { get; set; }

    public virtual supporter? supporter { get; set; }
}
