namespace EthioMarket.Core.Entities;

public class Favorite
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign keys
    public string UserId { get; set; } = string.Empty;
    public int ListingId { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Listing Listing { get; set; } = null!;
}