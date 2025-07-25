using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EthioMarket.Core.Entities;

namespace EthioMarket.Infrastructure.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(c => c.NameAm)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(c => c.Slug)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(c => c.Slug)
            .IsUnique();

        builder.Property(c => c.Description)
            .HasMaxLength(1000);

        builder.Property(c => c.DescriptionAm)
            .HasMaxLength(1000);

        builder.Property(c => c.IconName)
            .HasMaxLength(50);

        builder.Property(c => c.IsActive)
            .HasDefaultValue(true);

        builder.Property(c => c.SortOrder)
            .HasDefaultValue(0);

        builder.Property(c => c.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(c => c.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        // Self-referencing relationship
        builder.HasOne(c => c.Parent)
            .WithMany(c => c.Children)
            .HasForeignKey(c => c.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationship with listings
        builder.HasMany(c => c.Listings)
            .WithOne(l => l.Category)
            .HasForeignKey(l => l.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}