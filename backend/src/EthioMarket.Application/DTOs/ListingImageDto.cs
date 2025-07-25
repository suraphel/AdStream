namespace EthioMarket.Application.DTOs;

public class ListingImageDto
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long Size { get; set; }
    public string StoragePath { get; set; } = string.Empty;
    public string? AltText { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ListingId { get; set; }
    
    // For API responses
    public string? Url { get; set; }
}