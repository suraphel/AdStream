namespace EthioMarket.Core.Entities;

public class ListingImage
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public string StoragePath { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int SortOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Foreign key
    public int ListingId { get; set; }

    // Navigation property
    public Listing Listing { get; set; } = null!;
}