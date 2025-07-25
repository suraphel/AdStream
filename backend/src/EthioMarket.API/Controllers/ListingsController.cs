using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EthioMarket.Application.Services;
using EthioMarket.Application.DTOs;
using EthioMarket.Application.DTOs.Common;
using System.Security.Claims;

namespace EthioMarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ListingsController : ControllerBase
{
    private readonly IListingService _listingService;
    private readonly ILogger<ListingsController> _logger;

    public ListingsController(IListingService listingService, ILogger<ListingsController> logger)
    {
        _listingService = listingService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResponse<ListingDto>>>> GetListings([FromQuery] ListingSearchDto searchDto)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var result = await _listingService.GetAllAsync(searchDto, currentUserId);
            return Ok(ApiResponse<PagedResponse<ListingDto>>.SuccessResult(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching listings");
            return StatusCode(500, ApiResponse<PagedResponse<ListingDto>>.ErrorResult("Failed to fetch listings"));
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ListingDto>>> GetListing(int id)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var listing = await _listingService.GetByIdAsync(id, currentUserId);
            
            if (listing == null)
            {
                return NotFound(ApiResponse<ListingDto>.ErrorResult("Listing not found"));
            }

            // Increment view count (fire and forget)
            _ = Task.Run(() => _listingService.IncrementViewCountAsync(id));

            return Ok(ApiResponse<ListingDto>.SuccessResult(listing));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching listing {ListingId}", id);
            return StatusCode(500, ApiResponse<ListingDto>.ErrorResult("Failed to fetch listing"));
        }
    }

    [HttpGet("featured")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ListingDto>>>> GetFeaturedListings([FromQuery] int count = 10)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var listings = await _listingService.GetFeaturedAsync(count, currentUserId);
            return Ok(ApiResponse<IEnumerable<ListingDto>>.SuccessResult(listings));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching featured listings");
            return StatusCode(500, ApiResponse<IEnumerable<ListingDto>>.ErrorResult("Failed to fetch featured listings"));
        }
    }

    [HttpGet("recent")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ListingDto>>>> GetRecentListings([FromQuery] int count = 10)
    {
        try
        {
            var currentUserId = GetCurrentUserId();
            var listings = await _listingService.GetRecentAsync(count, currentUserId);
            return Ok(ApiResponse<IEnumerable<ListingDto>>.SuccessResult(listings));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching recent listings");
            return StatusCode(500, ApiResponse<IEnumerable<ListingDto>>.ErrorResult("Failed to fetch recent listings"));
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<ApiResponse<PagedResponse<ListingDto>>>> GetUserListings(
        string userId, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var result = await _listingService.GetByUserIdAsync(userId, page, pageSize);
            return Ok(ApiResponse<PagedResponse<ListingDto>>.SuccessResult(result));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user listings for {UserId}", userId);
            return StatusCode(500, ApiResponse<PagedResponse<ListingDto>>.ErrorResult("Failed to fetch user listings"));
        }
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ApiResponse<ListingDto>>> CreateListing([FromBody] CreateListingDto createListingDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<ListingDto>.ErrorResult("User not authenticated"));
            }

            var listing = await _listingService.CreateAsync(createListingDto, userId);
            return CreatedAtAction(nameof(GetListing), new { id = listing.Id }, 
                ApiResponse<ListingDto>.SuccessResult(listing, "Listing created successfully"));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<ListingDto>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating listing");
            return StatusCode(500, ApiResponse<ListingDto>.ErrorResult("Failed to create listing"));
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<ListingDto>>> UpdateListing(int id, [FromBody] UpdateListingDto updateListingDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<ListingDto>.ErrorResult("User not authenticated"));
            }

            var listing = await _listingService.UpdateAsync(id, updateListingDto, userId);
            return Ok(ApiResponse<ListingDto>.SuccessResult(listing, "Listing updated successfully"));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<ListingDto>.ErrorResult(ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ApiResponse<ListingDto>.ErrorResult(ex.Message).Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating listing {ListingId}", id);
            return StatusCode(500, ApiResponse<ListingDto>.ErrorResult("Failed to update listing"));
        }
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteListing(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("User not authenticated"));
            }

            var result = await _listingService.DeleteAsync(id, userId);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResult("Listing not found"));
            }

            return Ok(ApiResponse<bool>.SuccessResult(true, "Listing deleted successfully"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid(ApiResponse<bool>.ErrorResult(ex.Message).Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting listing {ListingId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResult("Failed to delete listing"));
        }
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}