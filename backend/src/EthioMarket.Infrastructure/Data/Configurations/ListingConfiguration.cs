using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EthioMarket.Core.Entities;
using EthioMarket.Core.Enums;

namespace EthioMarket.Infrastructure.Data.Configurations;

public class ListingConfiguration : IEntityTypeConfiguration<Listing>
{
    public void Configure(EntityTypeBuilder<Listing> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.Title)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(l => l.TitleAm)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(l => l.Description)
            .HasMaxLength(5000)
            .IsRequired();

        builder.Property(l => l.DescriptionAm)
            .HasMaxLength(5000)
            .IsRequired();

        builder.Property(l => l.Price)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(l => l.Currency)
            .HasMaxLength(3)
            .HasDefaultValue("ETB");

        builder.Property(l => l.Location)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(l => l.LocationAm)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(l => l.Condition)
            .HasConversion<int>()
            .HasDefaultValue(ItemCondition.Used);

        builder.Property(l => l.Status)
            .HasConversion<int>()
            .HasDefaultValue(ListingStatus.Active);

        builder.Property(l => l.IsFeatured)
            .HasDefaultValue(false);

        builder.Property(l => l.IsNegotiable)
            .HasDefaultValue(true);

        builder.Property(l => l.ViewCount)
            .HasDefaultValue(0);

        builder.Property(l => l.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(l => l.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Foreign keys
        builder.Property(l => l.UserId)
            .HasMaxLength(36)
            .IsRequired();

        builder.Property(l => l.CategoryId)
            .IsRequired();

        // Indexes
        builder.HasIndex(l => l.Title);
        builder.HasIndex(l => l.Location);
        builder.HasIndex(l => l.Price);
        builder.HasIndex(l => l.CreatedAt);
        builder.HasIndex(l => l.Status);

        // Relationships
        builder.HasOne(l => l.User)
            .WithMany(u => u.Listings)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.Category)
            .WithMany(c => c.Listings)
            .HasForeignKey(l => l.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(l => l.Images)
            .WithOne(i => i.Listing)
            .HasForeignKey(i => i.ListingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Favorites)
            .WithOne(f => f.Listing)
            .HasForeignKey(f => f.ListingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}