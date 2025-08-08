using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenderFloatingBindingApi.Models;

[Table("listing_images")]
public class ListingImage
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("listing_id")]
    [Required]
    public int ListingId { get; set; }

    [Column("image_url")]
    [StringLength(500)]
    [Required]
    public string ImageUrl { get; set; } = string.Empty;

    [Column("is_primary")]
    public bool IsPrimary { get; set; } = false;

    [Column("sort_order")]
    public int SortOrder { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("ListingId")]
    public virtual Listing Listing { get; set; } = null!;
}