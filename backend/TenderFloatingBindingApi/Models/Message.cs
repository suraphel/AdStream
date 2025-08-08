using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TenderFloatingBindingApi.Models;

[Table("messages")]
public class Message
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("sender_id")]
    [Required]
    public string SenderId { get; set; } = string.Empty;

    [Column("receiver_id")]
    [Required]
    public string ReceiverId { get; set; } = string.Empty;

    [Column("listing_id")]
    public int? ListingId { get; set; }

    [Column("content")]
    [Required]
    public string Content { get; set; } = string.Empty;

    [Column("is_read")]
    public bool IsRead { get; set; } = false;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("SenderId")]
    public virtual User Sender { get; set; } = null!;

    [ForeignKey("ReceiverId")]
    public virtual User Receiver { get; set; } = null!;

    [ForeignKey("ListingId")]
    public virtual Listing? Listing { get; set; }
}