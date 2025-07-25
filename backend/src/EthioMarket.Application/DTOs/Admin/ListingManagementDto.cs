using EthioMarket.Core.Enums;

namespace EthioMarket.Application.DTOs.Admin;

public class AdminListingDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string TitleAm { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionAm { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "ETB";
    public string Location { get; set; } = string.Empty;
    public string LocationAm { get; set; } = string.Empty;
    public ItemCondition Condition { get; set; }
    public ListingStatus Status { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsNegotiable { get; set; }
    public int ViewCount { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // User info
    public string UserId { get; set; } = string.Empty;
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    
    // Category info
    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public string? CategoryNameAm { get; set; }
    
    // Admin fields
    public bool IsFlagged { get; set; }
    public string? FlagReason { get; set; }
    public int FlagCount { get; set; }
    public string? AdminNotes { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public string? ReviewedBy { get; set; }
}

public class UpdateListingStatusDto
{
    public ListingStatus Status { get; set; }
    public string? Reason { get; set; }
    public string? ReasonAm { get; set; }
    public string? AdminNotes { get; set; }
}

public class FeatureListingDto
{
    public bool IsFeatured { get; set; }
    public DateTime? FeaturedUntil { get; set; }
    public string? Reason { get; set; }
}

public class AdminListingSearchDto
{
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public string? Location { get; set; }
    public string? UserId { get; set; }
    public ListingStatus? Status { get; set; }
    public bool? IsFeatured { get; set; }
    public bool? IsFlagged { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public DateTime? CreatedAfter { get; set; }
    public DateTime? CreatedBefore { get; set; }
    public string? SortBy { get; set; } = "recent";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}