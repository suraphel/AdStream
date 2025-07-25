using EthioMarket.Core.Enums;

namespace EthioMarket.Application.DTOs;

public class ListingDto
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
    
    // Navigation properties
    public string UserId { get; set; } = string.Empty;
    public UserDto? User { get; set; }
    public int CategoryId { get; set; }
    public CategoryDto? Category { get; set; }
    public List<ListingImageDto> Images { get; set; } = new();
    public bool IsFavorited { get; set; }
}

public class CreateListingDto
{
    public string Title { get; set; } = string.Empty;
    public string TitleAm { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionAm { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = "ETB";
    public string Location { get; set; } = string.Empty;
    public string LocationAm { get; set; } = string.Empty;
    public ItemCondition Condition { get; set; } = ItemCondition.Used;
    public bool IsNegotiable { get; set; } = true;
    public int CategoryId { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class UpdateListingDto
{
    public string? Title { get; set; }
    public string? TitleAm { get; set; }
    public string? Description { get; set; }
    public string? DescriptionAm { get; set; }
    public decimal? Price { get; set; }
    public string? Currency { get; set; }
    public string? Location { get; set; }
    public string? LocationAm { get; set; }
    public ItemCondition? Condition { get; set; }
    public ListingStatus? Status { get; set; }
    public bool? IsNegotiable { get; set; }
    public int? CategoryId { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

public class ListingSearchDto
{
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public string? Location { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public ItemCondition? Condition { get; set; }
    public bool? IsFeatured { get; set; }
    public string? SortBy { get; set; } = "recent";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}