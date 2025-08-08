using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenderFloatingBindingApi.Models;

[Table("categories")]
public class Category
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [StringLength(100)]
    [Required]
    public string Name { get; set; } = string.Empty;

    [Column("name_am")]
    [StringLength(100)]
    public string? NameAm { get; set; }

    [Column("slug")]
    [StringLength(100)]
    [Required]
    public string Slug { get; set; } = string.Empty;

    [Column("icon")]
    [StringLength(50)]
    public string? Icon { get; set; }

    [Column("parent_id")]
    public int? ParentId { get; set; }

    [Column("group_name")]
    [StringLength(50)]
    public string? GroupName { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("sort_order")]
    public int SortOrder { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Category? Parent { get; set; }
    public virtual ICollection<Category> Children { get; set; } = new List<Category>();
    public virtual ICollection<Listing> Listings { get; set; } = new List<Listing>();

    // Self-referencing relationship
    [ForeignKey("ParentId")]
    public virtual Category? ParentCategory { get; set; }
}