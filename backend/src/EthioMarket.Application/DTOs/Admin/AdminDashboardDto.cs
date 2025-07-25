namespace EthioMarket.Application.DTOs.Admin;

public class AdminDashboardDto
{
    public DashboardStatsDto Stats { get; set; } = new();
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
    public List<FlaggedContentDto> FlaggedContent { get; set; } = new();
}

public class DashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalListings { get; set; }
    public int ActiveListings { get; set; }
    public int PendingListings { get; set; }
    public int FlaggedListings { get; set; }
    public int TotalCategories { get; set; }
    public decimal TotalRevenue { get; set; }
    public int NewUsersToday { get; set; }
    public int NewListingsToday { get; set; }
}

public class RecentActivityDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "user_registered", "listing_created", "listing_flagged", etc.
    public string Description { get; set; } = string.Empty;
    public string DescriptionAm { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public int? ListingId { get; set; }
    public string? ListingTitle { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Severity { get; set; } = "info"; // "info", "warning", "error"
}

public class FlaggedContentDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // "listing", "user", "comment"
    public int? ListingId { get; set; }
    public string? ListingTitle { get; set; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string ReasonAm { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // "pending", "reviewed", "resolved", "dismissed"
    public string ReportedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedBy { get; set; }
    public string? Notes { get; set; }
}