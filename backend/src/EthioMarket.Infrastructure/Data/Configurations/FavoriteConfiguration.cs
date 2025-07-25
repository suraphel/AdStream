using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EthioMarket.Core.Entities;

namespace EthioMarket.Infrastructure.Data.Configurations;

public class FavoriteConfiguration : IEntityTypeConfiguration<Favorite>
{
    public void Configure(EntityTypeBuilder<Favorite> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Foreign keys
        builder.Property(f => f.UserId)
            .HasMaxLength(36)
            .IsRequired();

        builder.Property(f => f.ListingId)
            .IsRequired();

        // Unique constraint - user can only favorite a listing once
        builder.HasIndex(f => new { f.UserId, f.ListingId })
            .IsUnique();

        // Individual indexes for queries
        builder.HasIndex(f => f.UserId);
        builder.HasIndex(f => f.ListingId);

        // Relationships
        builder.HasOne(f => f.User)
            .WithMany(u => u.Favorites)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(f => f.Listing)
            .WithMany(l => l.Favorites)
            .HasForeignKey(f => f.ListingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}