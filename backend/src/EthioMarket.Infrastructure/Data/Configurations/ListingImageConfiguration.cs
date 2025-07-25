using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EthioMarket.Core.Entities;

namespace EthioMarket.Infrastructure.Data.Configurations;

public class ListingImageConfiguration : IEntityTypeConfiguration<ListingImage>
{
    public void Configure(EntityTypeBuilder<ListingImage> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.FileName)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(i => i.OriginalFileName)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(i => i.ContentType)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(i => i.Size)
            .IsRequired();

        builder.Property(i => i.StoragePath)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(i => i.AltText)
            .HasMaxLength(255);

        builder.Property(i => i.SortOrder)
            .HasDefaultValue(0);

        builder.Property(i => i.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Foreign key
        builder.Property(i => i.ListingId)
            .IsRequired();

        // Indexes
        builder.HasIndex(i => i.ListingId);
        builder.HasIndex(i => new { i.ListingId, i.SortOrder });

        // Relationship
        builder.HasOne(i => i.Listing)
            .WithMany(l => l.Images)
            .HasForeignKey(i => i.ListingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}