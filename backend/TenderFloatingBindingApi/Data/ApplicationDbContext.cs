using Microsoft.EntityFrameworkCore;
using TenderFloatingBindingApi.Models;

namespace TenderFloatingBindingApi.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Listing> Listings { get; set; } = null!;
    public DbSet<ListingImage> ListingImages { get; set; } = null!;
    public DbSet<Favorite> Favorites { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships
        
        // User relationships
        modelBuilder.Entity<User>()
            .HasMany(u => u.Listings)
            .WithOne(l => l.User)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasMany(u => u.Favorites)
            .WithOne(f => f.User)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasMany(u => u.SentMessages)
            .WithOne(m => m.Sender)
            .HasForeignKey(m => m.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<User>()
            .HasMany(u => u.ReceivedMessages)
            .WithOne(m => m.Receiver)
            .HasForeignKey(m => m.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        // Category self-referencing relationship
        modelBuilder.Entity<Category>()
            .HasOne(c => c.ParentCategory)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Listing relationships
        modelBuilder.Entity<Listing>()
            .HasOne(l => l.Category)
            .WithMany(c => c.Listings)
            .HasForeignKey(l => l.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Listing>()
            .HasMany(l => l.Images)
            .WithOne(i => i.Listing)
            .HasForeignKey(i => i.ListingId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Listing>()
            .HasMany(l => l.Favorites)
            .WithOne(f => f.Listing)
            .HasForeignKey(f => f.ListingId)
            .OnDelete(DeleteBehavior.Cascade);

        // Message relationships
        modelBuilder.Entity<Message>()
            .HasOne(m => m.Listing)
            .WithMany()
            .HasForeignKey(m => m.ListingId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure indexes for performance
        modelBuilder.Entity<Listing>()
            .HasIndex(l => l.CategoryId);

        modelBuilder.Entity<Listing>()
            .HasIndex(l => l.UserId);

        modelBuilder.Entity<Listing>()
            .HasIndex(l => l.CreatedAt);

        modelBuilder.Entity<Listing>()
            .HasIndex(l => l.IsActive);

        modelBuilder.Entity<Listing>()
            .HasIndex(l => l.IsFeatured);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email);

        modelBuilder.Entity<Category>()
            .HasIndex(c => c.Slug);

        // Configure unique constraints
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Category>()
            .HasIndex(c => c.Slug)
            .IsUnique();

        // Configure composite unique constraint for favorites
        modelBuilder.Entity<Favorite>()
            .HasIndex(f => new { f.UserId, f.ListingId })
            .IsUnique();
    }
}