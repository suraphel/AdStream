namespace EthioMarket.Application.DTOs;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string NameAm { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DescriptionAm { get; set; }
    public string? IconName { get; set; }
    public int? ParentId { get; set; }
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Additional properties for API responses
    public int ListingCount { get; set; }
    public List<CategoryDto> Children { get; set; } = new();
}

public class CreateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string NameAm { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DescriptionAm { get; set; }
    public string? IconName { get; set; }
    public int? ParentId { get; set; }
    public int SortOrder { get; set; } = 0;
}

public class UpdateCategoryDto
{
    public string? Name { get; set; }
    public string? NameAm { get; set; }
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public string? DescriptionAm { get; set; }
    public string? IconName { get; set; }
    public int? ParentId { get; set; }
    public bool? IsActive { get; set; }
    public int? SortOrder { get; set; }
}