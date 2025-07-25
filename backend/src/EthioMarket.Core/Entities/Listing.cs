using EthioMarket.Core.Enums;

namespace EthioMarket.Core.Entities;

public class Listing
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string TitleAm { get; set; } = string.Empty; // Amharic title
    public string Description { get; set; } = string.Empty;
    public string DescriptionAm { get; set; } = string.Empty; // Amharic description
    public decimal Price { get; set; }
    public string Currency { get; set; } = "ETB";
    public string Location { get; set; } = string.Empty;
    public string LocationAm { get; set; } = string.Empty; // Amharic location
    public ItemCondition Condition { get; set; } = ItemCondition.Used;
    public ListingStatus Status { get; set; } = ListingStatus.Active;
    public bool IsFeatured { get; set; } = false;
    public bool IsNegotiable { get; set; } = true;
    public int ViewCount { get; set; } = 0;
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public string UserId { get; set; } = string.Empty;
    public int CategoryId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public ICollection<ListingImage> Images { get; set; } = new List<ListingImage>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
}