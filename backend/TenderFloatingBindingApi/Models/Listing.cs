using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenderFloatingBindingApi.Models;

[Table("listings")]
public class Listing
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("title")]
    [StringLength(200)]
    [Required]
    public string Title { get; set; } = string.Empty;

    [Column("description")]
    [Required]
    public string Description { get; set; } = string.Empty;

    [Column("price", TypeName = "decimal(12,2)")]
    [Required]
    public decimal Price { get; set; }

    [Column("currency")]
    [StringLength(3)]
    public string Currency { get; set; } = "ETB";

    [Column("category_id")]
    [Required]
    public int CategoryId { get; set; }

    [Column("user_id")]
    [Required]
    public string UserId { get; set; } = string.Empty;

    [Column("location")]
    [StringLength(100)]
    [Required]
    public string Location { get; set; } = string.Empty;

    [Column("condition")]
    [StringLength(20)]
    public string? Condition { get; set; }

    [Column("is_featured")]
    public bool IsFeatured { get; set; } = false;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("view_count")]
    public int ViewCount { get; set; } = 0;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("expires_at")]
    public DateTime? ExpiresAt { get; set; }

    // External listing integration fields
    [Column("external_source")]
    [StringLength(50)]
    public string? ExternalSource { get; set; }

    [Column("external_id")]
    [StringLength(100)]
    public string? ExternalId { get; set; }

    [Column("external_url")]
    [StringLength(500)]
    public string? ExternalUrl { get; set; }

    [Column("external_data")]
    public string? ExternalData { get; set; } // JSON string

    // Airline ticket specific fields
    [Column("departure_city")]
    [StringLength(100)]
    public string? DepartureCity { get; set; }

    [Column("arrival_city")]
    [StringLength(100)]
    public string? ArrivalCity { get; set; }

    [Column("departure_date")]
    public DateTime? DepartureDate { get; set; }

    [Column("return_date")]
    public DateTime? ReturnDate { get; set; }

    [Column("airline")]
    [StringLength(50)]
    public string? Airline { get; set; }

    [Column("flight_class")]
    [StringLength(20)]
    public string? FlightClass { get; set; }

    [Column("trip_type")]
    [StringLength(20)]
    public string? TripType { get; set; }

    [Column("passenger_count")]
    public int PassengerCount { get; set; } = 1;

    [Column("last_synced_at")]
    public DateTime? LastSyncedAt { get; set; }

    [Column("sync_status")]
    [StringLength(20)]
    public string SyncStatus { get; set; } = "active";

    // Vehicle-specific fields
    [Column("model_year")]
    public int? ModelYear { get; set; }

    [Column("mileage")]
    public int? Mileage { get; set; }

    [Column("doors")]
    public int? Doors { get; set; }

    [Column("gearbox_type")]
    [StringLength(20)]
    public string? GearboxType { get; set; }

    [Column("fuel_type")]
    [StringLength(20)]
    public string? FuelType { get; set; }

    // Electronics-specific fields
    [Column("cpu")]
    [StringLength(100)]
    public string? Cpu { get; set; }

    [Column("ram")]
    [StringLength(50)]
    public string? Ram { get; set; }

    [Column("gpu")]
    [StringLength(100)]
    public string? Gpu { get; set; }

    [Column("motherboard")]
    [StringLength(100)]
    public string? Motherboard { get; set; }

    [Column("storage_type")]
    [StringLength(20)]
    public string? StorageType { get; set; }

    [Column("storage_size")]
    [StringLength(50)]
    public string? StorageSize { get; set; }

    // Premium features
    [Column("is_boosted")]
    public bool IsBoosted { get; set; } = false;

    [Column("boosted_until")]
    public DateTime? BoostedUntil { get; set; }

    [Column("boost_level")]
    public int BoostLevel { get; set; } = 0;

    // Navigation properties
    [ForeignKey("CategoryId")]
    public virtual Category Category { get; set; } = null!;

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    public virtual ICollection<ListingImage> Images { get; set; } = new List<ListingImage>();
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
}