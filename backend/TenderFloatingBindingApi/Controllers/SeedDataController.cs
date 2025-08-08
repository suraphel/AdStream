using Microsoft.AspNetCore.Mvc;
using TenderFloatingBindingApi.Data;
using TenderFloatingBindingApi.Models;

namespace TenderFloatingBindingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SeedDataController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SeedDataController> _logger;

    public SeedDataController(ApplicationDbContext context, ILogger<SeedDataController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("categories")]
    public async Task<IActionResult> SeedCategories()
    {
        try
        {
            if (_context.Categories.Any())
            {
                return Ok(new { message = "Categories already exist" });
            }

            var categories = new List<Category>
            {
                new Category { Id = 85, Name = "Electronics", NameAm = "ኤሌክትሮኒክስ", Slug = "electronics", Icon = "laptop", GroupName = "electronics", SortOrder = 1 },
                new Category { Id = 86, Name = "Vehicles", NameAm = "መኪናዎች", Slug = "vehicles", Icon = "car", GroupName = "vehicles", SortOrder = 2 },
                new Category { Id = 87, Name = "Property", NameAm = "ንብረት", Slug = "property", Icon = "home", GroupName = "property", SortOrder = 3 },
                new Category { Id = 88, Name = "Jobs", NameAm = "ስራዎች", Slug = "jobs", Icon = "briefcase", GroupName = "jobs", SortOrder = 4 },
                new Category { Id = 89, Name = "Fashion", NameAm = "ፋሽን", Slug = "fashion", Icon = "shirt", GroupName = "fashion", SortOrder = 5 }
            };

            await _context.Categories.AddRangeAsync(categories);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Categories seeded successfully");
            return Ok(new { message = "Categories seeded successfully", count = categories.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding categories");
            return StatusCode(500, "Error seeding categories");
        }
    }

    [HttpPost("sample-listings")]
    public async Task<IActionResult> SeedSampleListings()
    {
        try
        {
            if (_context.Listings.Any())
            {
                return Ok(new { message = "Listings already exist" });
            }

            // Create a sample user first
            var sampleUser = new User
            {
                Id = "sample-user-1",
                Email = "demo@example.com",
                FirstName = "Demo",
                LastName = "User",
                City = "Addis Ababa",
                Region = "Addis Ababa",
                IsVerified = true,
                PhoneVerified = true
            };

            await _context.Users.AddAsync(sampleUser);

            var listings = new List<Listing>
            {
                new Listing
                {
                    Title = "2019 Toyota Camry - Low Mileage",
                    Description = "Excellent condition Toyota Camry with low mileage. Well-maintained, single owner vehicle.",
                    Price = 45000.00m,
                    Currency = "ETB",
                    CategoryId = 86,
                    UserId = "sample-user-1",
                    Location = "Addis Ababa",
                    Condition = "used",
                    ModelYear = 2019,
                    Mileage = 35000,
                    GearboxType = "automatic",
                    FuelType = "petrol",
                    IsActive = true,
                    ViewCount = 125
                },
                new Listing
                {
                    Title = "iPhone 13 Pro - Excellent Condition",
                    Description = "iPhone 13 Pro in excellent condition, comes with original box and charger.",
                    Price = 25000.00m,
                    Currency = "ETB",
                    CategoryId = 85,
                    UserId = "sample-user-1",
                    Location = "Addis Ababa",
                    Condition = "used",
                    IsActive = true,
                    ViewCount = 89
                },
                new Listing
                {
                    Title = "Modern 2BR Apartment - Bole",
                    Description = "Beautiful modern apartment in prime Bole location with all amenities.",
                    Price = 3500000.00m,
                    Currency = "ETB",
                    CategoryId = 87,
                    UserId = "sample-user-1",
                    Location = "Bole, Addis Ababa",
                    Condition = "new",
                    IsActive = true,
                    IsFeatured = true,
                    ViewCount = 234
                }
            };

            await _context.Listings.AddRangeAsync(listings);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Sample listings seeded successfully");
            return Ok(new { message = "Sample listings seeded successfully", count = listings.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding sample listings");
            return StatusCode(500, "Error seeding sample listings");
        }
    }
}