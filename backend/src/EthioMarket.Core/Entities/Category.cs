namespace EthioMarket.Core.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAm { get; set; } = string.Empty; // Amharic name
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DescriptionAm { get; set; } // Amharic description
    public string? IconName { get; set; }
    public int? ParentId { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Category? Parent { get; set; }
    public ICollection<Category> Children { get; set; } = new List<Category>();
    public ICollection<Listing> Listings { get; set; } = new List<Listing>();
}