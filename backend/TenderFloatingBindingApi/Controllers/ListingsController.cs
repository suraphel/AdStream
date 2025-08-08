using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TenderFloatingBindingApi.Data;
using TenderFloatingBindingApi.Models;

namespace TenderFloatingBindingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ListingsController> _logger;

    public ListingsController(ApplicationDbContext context, ILogger<ListingsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<object>>> GetListings(
        [FromQuery] string? search,
        [FromQuery] int? category,
        [FromQuery] string? location,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20,
        [FromQuery] bool featured = false,
        [FromQuery] decimal? priceMin = null,
        [FromQuery] decimal? priceMax = null,
        [FromQuery] string? condition = null,
        [FromQuery] string? brands = null,
        [FromQuery] string? transmission = null,
        [FromQuery] int? mileageMin = null,
        [FromQuery] int? mileageMax = null,
        [FromQuery] string sort = "recent")
    {
        try
        {
            var query = _context.Listings
                .Include(l => l.User)
                .Include(l => l.Category)
                .Include(l => l.Images)
                .Where(l => l.IsActive);

            // Apply filters
            if (category.HasValue)
                query = query.Where(l => l.CategoryId == category.Value);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(l => l.Title.Contains(search) || l.Description.Contains(search));

            if (!string.IsNullOrEmpty(location))
                query = query.Where(l => l.Location.Contains(location));

            if (featured)
                query = query.Where(l => l.IsFeatured);

            if (priceMin.HasValue)
                query = query.Where(l => l.Price >= priceMin.Value);

            if (priceMax.HasValue)
                query = query.Where(l => l.Price <= priceMax.Value);

            // Condition filtering - include NULL values for listings without condition data
            if (!string.IsNullOrEmpty(condition) && condition != "all")
            {
                var conditions = condition.Split(',').Select(c => c.ToLower()).ToArray();
                query = query.Where(l => l.Condition == null || conditions.Contains(l.Condition.ToLower()));
            }

            // Transmission filtering for vehicles - include NULL values
            if (!string.IsNullOrEmpty(transmission) && transmission != "any")
            {
                query = query.Where(l => l.GearboxType == null || l.GearboxType == transmission);
            }

            // Mileage filtering for vehicles - include NULL values
            if (mileageMin.HasValue && mileageMax.HasValue)
            {
                query = query.Where(l => l.Mileage == null || 
                    (l.Mileage >= mileageMin.Value && l.Mileage <= mileageMax.Value));
            }
            else if (mileageMin.HasValue)
            {
                query = query.Where(l => l.Mileage == null || l.Mileage >= mileageMin.Value);
            }
            else if (mileageMax.HasValue)
            {
                query = query.Where(l => l.Mileage == null || l.Mileage <= mileageMax.Value);
            }

            // Apply sorting
            query = sort.ToLower() switch
            {
                "price-low" => query.OrderBy(l => l.Price),
                "price-high" => query.OrderByDescending(l => l.Price),
                "oldest" => query.OrderBy(l => l.CreatedAt),
                _ => query.OrderByDescending(l => l.CreatedAt) // recent (default)
            };

            // Apply pagination
            var totalCount = await query.CountAsync();
            var listings = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(l => new
                {
                    l.Id,
                    l.Title,
                    l.Description,
                    l.Price,
                    l.Currency,
                    l.CategoryId,
                    l.UserId,
                    l.Location,
                    l.Condition,
                    l.IsFeatured,
                    l.IsActive,
                    l.ViewCount,
                    l.CreatedAt,
                    l.UpdatedAt,
                    l.ExpiresAt,
                    l.ExternalSource,
                    l.ExternalId,
                    l.ExternalUrl,
                    l.ExternalData,
                    l.DepartureCity,
                    l.ArrivalCity,
                    l.DepartureDate,
                    l.ReturnDate,
                    l.Airline,
                    l.FlightClass,
                    l.TripType,
                    l.PassengerCount,
                    l.LastSyncedAt,
                    l.SyncStatus,
                    l.ModelYear,
                    l.Mileage,
                    l.Doors,
                    l.GearboxType,
                    l.FuelType,
                    l.Cpu,
                    l.Ram,
                    l.Gpu,
                    l.Motherboard,
                    l.StorageType,
                    l.StorageSize,
                    l.IsBoosted,
                    l.BoostedUntil,
                    l.BoostLevel,
                    User = new
                    {
                        l.User.Id,
                        l.User.Email,
                        l.User.FirstName,
                        l.User.LastName,
                        l.User.ProfileImageUrl,
                        l.User.Phone,
                        l.User.PhoneNumber,
                        l.User.Region,
                        l.User.City,
                        l.User.IsVerified,
                        l.User.PhoneVerified,
                        l.User.TextNotificationsEnabled,
                        l.User.Preferences,
                        l.User.CreatedAt,
                        l.User.UpdatedAt
                    },
                    Category = new
                    {
                        l.Category.Id,
                        l.Category.Name,
                        l.Category.NameAm,
                        l.Category.Slug,
                        l.Category.Icon,
                        l.Category.ParentId,
                        l.Category.GroupName,
                        l.Category.IsActive,
                        l.Category.SortOrder,
                        l.Category.CreatedAt
                    },
                    Images = l.Images.Select(img => new
                    {
                        img.Id,
                        img.ImageUrl,
                        img.IsPrimary,
                        img.SortOrder
                    }).ToList()
                })
                .ToListAsync();

            _logger.LogInformation($"[LISTINGS] Returning {listings.Count} listings, first few IDs: {string.Join(", ", listings.Take(3).Select(l => l.Id))}");
            
            return Ok(listings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching listings");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetListing(int id)
    {
        try
        {
            var listing = await _context.Listings
                .Include(l => l.User)
                .Include(l => l.Category)
                .Include(l => l.Images)
                .Where(l => l.Id == id && l.IsActive)
                .Select(l => new
                {
                    l.Id,
                    l.Title,
                    l.Description,
                    l.Price,
                    l.Currency,
                    l.CategoryId,
                    l.UserId,
                    l.Location,
                    l.Condition,
                    l.IsFeatured,
                    l.IsActive,
                    l.ViewCount,
                    l.CreatedAt,
                    l.UpdatedAt,
                    l.ExpiresAt,
                    l.ExternalSource,
                    l.ExternalId,
                    l.ExternalUrl,
                    l.ExternalData,
                    l.DepartureCity,
                    l.ArrivalCity,
                    l.DepartureDate,
                    l.ReturnDate,
                    l.Airline,
                    l.FlightClass,
                    l.TripType,
                    l.PassengerCount,
                    l.LastSyncedAt,
                    l.SyncStatus,
                    l.ModelYear,
                    l.Mileage,
                    l.Doors,
                    l.GearboxType,
                    l.FuelType,
                    l.Cpu,
                    l.Ram,
                    l.Gpu,
                    l.Motherboard,
                    l.StorageType,
                    l.StorageSize,
                    l.IsBoosted,
                    l.BoostedUntil,
                    l.BoostLevel,
                    User = new
                    {
                        l.User.Id,
                        l.User.Email,
                        l.User.FirstName,
                        l.User.LastName,
                        l.User.ProfileImageUrl,
                        l.User.Phone,
                        l.User.PhoneNumber,
                        l.User.Region,
                        l.User.City,
                        l.User.IsVerified,
                        l.User.PhoneVerified,
                        l.User.TextNotificationsEnabled,
                        l.User.Preferences,
                        l.User.CreatedAt,
                        l.User.UpdatedAt
                    },
                    Category = new
                    {
                        l.Category.Id,
                        l.Category.Name,
                        l.Category.NameAm,
                        l.Category.Slug,
                        l.Category.Icon,
                        l.Category.ParentId,
                        l.Category.GroupName,
                        l.Category.IsActive,
                        l.Category.SortOrder,
                        l.Category.CreatedAt
                    },
                    Images = l.Images.Select(img => new
                    {
                        img.Id,
                        img.ImageUrl,
                        img.IsPrimary,
                        img.SortOrder
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (listing == null)
                return NotFound();

            // Increment view count
            var listingEntity = await _context.Listings.FindAsync(id);
            if (listingEntity != null)
            {
                listingEntity.ViewCount++;
                await _context.SaveChangesAsync();
            }

            return Ok(listing);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching listing {ListingId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}