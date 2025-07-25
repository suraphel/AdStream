using Microsoft.EntityFrameworkCore;
using EthioMarket.Core.Entities;
using EthioMarket.Infrastructure.Data.Configurations;

namespace EthioMarket.Infrastructure.Data;

public class EthioMarketContext : DbContext
{
    public EthioMarketContext(DbContextOptions<EthioMarketContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Listing> Listings { get; set; }
    public DbSet<ListingImage> ListingImages { get; set; }
    public DbSet<Favorite> Favorites { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply configurations
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new CategoryConfiguration());
        modelBuilder.ApplyConfiguration(new ListingConfiguration());
        modelBuilder.ApplyConfiguration(new ListingImageConfiguration());
        modelBuilder.ApplyConfiguration(new FavoriteConfiguration());

        // Global query filters
        modelBuilder.Entity<User>().HasQueryFilter(u => u.IsActive);
        modelBuilder.Entity<Category>().HasQueryFilter(c => c.IsActive);
        
        // Seed data will be added here
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        // Seed categories
        modelBuilder.Entity<Category>().HasData(
            new Category
            {
                Id = 1,
                Name = "Electronics",
                NameAm = "ኤሌክትሮኒክስ",
                Slug = "electronics",
                Description = "Electronics and gadgets",
                DescriptionAm = "ኤሌክትሮኒክስ እና መሳሪያዎች",
                IconName = "laptop",
                SortOrder = 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = 2,
                Name = "Vehicles",
                NameAm = "ተሽከርካሪዎች",
                Slug = "vehicles",
                Description = "Cars, motorcycles, and other vehicles",
                DescriptionAm = "መኪናዎች፣ ሞተር ሳይክሎች እና ሌሎች ተሽከርካሪዎች",
                IconName = "car",
                SortOrder = 2,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = 3,
                Name = "Real Estate",
                NameAm = "ሪል እስቴት",
                Slug = "real-estate",
                Description = "Houses, apartments, and land",
                DescriptionAm = "ቤቶች፣ አፓርትመንቶች እና መሬት",
                IconName = "home",
                SortOrder = 3,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = 4,
                Name = "Jobs",
                NameAm = "ስራዎች",
                Slug = "jobs",
                Description = "Job opportunities and career services",
                DescriptionAm = "የስራ እድሎች እና የሙያ አገልግሎቶች",
                IconName = "briefcase",
                SortOrder = 4,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = 5,
                Name = "Fashion",
                NameAm = "ፋሽን",
                Slug = "fashion",
                Description = "Clothing, shoes, and accessories",
                DescriptionAm = "ልብስ፣ ጫማ እና መለዋወጫዎች",
                IconName = "shirt",
                SortOrder = 5,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = 6,
                Name = "Services",
                NameAm = "አገልግሎቶች",
                Slug = "services",
                Description = "Professional and personal services",
                DescriptionAm = "ሙያዊ እና ግላዊ አገልግሎቶች",
                IconName = "gamepad2",
                SortOrder = 6,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = 7,
                Name = "Sports & Recreation",
                NameAm = "ስፖርት እና መዝናኛ",
                Slug = "sports-recreation",
                Description = "Sports equipment and recreational items",
                DescriptionAm = "የስፖርት መሳሪያዎች እና የመዝናኛ ዕቃዎች",
                IconName = "gamepad2",
                SortOrder = 7,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Category
            {
                Id = 8,
                Name = "Home & Garden",
                NameAm = "ቤት እና ገነት",
                Slug = "home-garden",
                Description = "Furniture, appliances, and garden items",
                DescriptionAm = "የቤት እቃዎች፣ ማሽኖች እና የገነት እቃዎች",
                IconName = "sofa",
                SortOrder = 8,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        );
    }
}