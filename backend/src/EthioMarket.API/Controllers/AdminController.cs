using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EthioMarket.Application.Services;
using EthioMarket.Application.DTOs.Admin;
using EthioMarket.Application.DTOs.Common;
using EthioMarket.Core.Enums;
using System.Security.Claims;

namespace EthioMarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Moderator")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IAdminService adminService, ILogger<AdminController> logger)
    {
        _adminService = adminService;
        _logger = logger;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<AdminDashboardDto>>> GetDashboard()
    {
        try
        {
            var dashboard = await _adminService.GetDashboardAsync();
            return Ok(ApiResponse<AdminDashboardDto>.SuccessResult(dashboard));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching admin dashboard");
            return StatusCode(500, ApiResponse<AdminDashboardDto>.ErrorResult("Failed to fetch dashboard"));
        }
    }

    [HttpGet("users")]
    public async Task<ActionResult<ApiResponse<PagedResponse<AdminUserDto>>>> GetUsers([FromQuery] UserSearchDto searchDto)
    {
        try
        {
            var users = await _adminService.GetUsersAsync(searchDto);
            return Ok(ApiResponse<PagedResponse<AdminUserDto>>.SuccessResult(users));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching users for admin");
            return StatusCode(500, ApiResponse<PagedResponse<AdminUserDto>>.ErrorResult("Failed to fetch users"));
        }
    }

    [HttpGet("users/{userId}")]
    public async Task<ActionResult<ApiResponse<AdminUserDto>>> GetUser(string userId)
    {
        try
        {
            var user = await _adminService.GetUserAsync(userId);
            if (user == null)
            {
                return NotFound(ApiResponse<AdminUserDto>.ErrorResult("User not found"));
            }

            return Ok(ApiResponse<AdminUserDto>.SuccessResult(user));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching user {UserId} for admin", userId);
            return StatusCode(500, ApiResponse<AdminUserDto>.ErrorResult("Failed to fetch user"));
        }
    }

    [HttpPut("users/{userId}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateUserRole(string userId, [FromBody] UpdateUserRoleDto updateDto)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(adminUserId))
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("Admin not authenticated"));
            }

            var result = await _adminService.UpdateUserRoleAsync(userId, updateDto, adminUserId);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResult("User not found"));
            }

            return Ok(ApiResponse<bool>.SuccessResult(true, "User role updated successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user role for {UserId}", userId);
            return StatusCode(500, ApiResponse<bool>.ErrorResult("Failed to update user role"));
        }
    }

    [HttpPost("users/{userId}/suspend")]
    public async Task<ActionResult<ApiResponse<bool>>> SuspendUser(string userId, [FromBody] SuspendUserDto suspendDto)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(adminUserId))
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("Admin not authenticated"));
            }

            var result = await _adminService.SuspendUserAsync(userId, suspendDto, adminUserId);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResult("User not found"));
            }

            return Ok(ApiResponse<bool>.SuccessResult(true, "User suspended successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error suspending user {UserId}", userId);
            return StatusCode(500, ApiResponse<bool>.ErrorResult("Failed to suspend user"));
        }
    }

    [HttpPost("users/{userId}/unsuspend")]
    public async Task<ActionResult<ApiResponse<bool>>> UnsuspendUser(string userId)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(adminUserId))
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("Admin not authenticated"));
            }

            var result = await _adminService.UnsuspendUserAsync(userId, adminUserId);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResult("User not found"));
            }

            return Ok(ApiResponse<bool>.SuccessResult(true, "User unsuspended successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unsuspending user {UserId}", userId);
            return StatusCode(500, ApiResponse<bool>.ErrorResult("Failed to unsuspend user"));
        }
    }

    [HttpGet("listings")]
    public async Task<ActionResult<ApiResponse<PagedResponse<AdminListingDto>>>> GetListings([FromQuery] AdminListingSearchDto searchDto)
    {
        try
        {
            var listings = await _adminService.GetListingsAsync(searchDto);
            return Ok(ApiResponse<PagedResponse<AdminListingDto>>.SuccessResult(listings));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching listings for admin");
            return StatusCode(500, ApiResponse<PagedResponse<AdminListingDto>>.ErrorResult("Failed to fetch listings"));
        }
    }

    [HttpGet("listings/{listingId:int}")]
    public async Task<ActionResult<ApiResponse<AdminListingDto>>> GetListing(int listingId)
    {
        try
        {
            var listing = await _adminService.GetListingAsync(listingId);
            if (listing == null)
            {
                return NotFound(ApiResponse<AdminListingDto>.ErrorResult("Listing not found"));
            }

            return Ok(ApiResponse<AdminListingDto>.SuccessResult(listing));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching listing {ListingId} for admin", listingId);
            return StatusCode(500, ApiResponse<AdminListingDto>.ErrorResult("Failed to fetch listing"));
        }
    }

    [HttpPut("listings/{listingId:int}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateListingStatus(int listingId, [FromBody] UpdateListingStatusDto updateDto)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(adminUserId))
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("Admin not authenticated"));
            }

            var result = await _adminService.UpdateListingStatusAsync(listingId, updateDto, adminUserId);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResult("Listing not found"));
            }

            return Ok(ApiResponse<bool>.SuccessResult(true, "Listing status updated successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating listing status for {ListingId}", listingId);
            return StatusCode(500, ApiResponse<bool>.ErrorResult("Failed to update listing status"));
        }
    }

    [HttpPut("listings/{listingId:int}/feature")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ApiResponse<bool>>> FeatureListing(int listingId, [FromBody] FeatureListingDto featureDto)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(adminUserId))
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("Admin not authenticated"));
            }

            var result = await _adminService.FeatureListingAsync(listingId, featureDto, adminUserId);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResult("Listing not found"));
            }

            var message = featureDto.IsFeatured ? "Listing featured successfully" : "Listing unfeatured successfully";
            return Ok(ApiResponse<bool>.SuccessResult(true, message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error featuring/unfeaturing listing {ListingId}", listingId);
            return StatusCode(500, ApiResponse<bool>.ErrorResult("Failed to update listing feature status"));
        }
    }

    [HttpGet("flagged-content")]
    public async Task<ActionResult<ApiResponse<List<FlaggedContentDto>>>> GetFlaggedContent([FromQuery] int count = 50)
    {
        try
        {
            var flaggedContent = await _adminService.GetFlaggedContentAsync(count);
            return Ok(ApiResponse<List<FlaggedContentDto>>.SuccessResult(flaggedContent));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching flagged content");
            return StatusCode(500, ApiResponse<List<FlaggedContentDto>>.ErrorResult("Failed to fetch flagged content"));
        }
    }

    [HttpPost("flagged-content/{flagId:int}/resolve")]
    public async Task<ActionResult<ApiResponse<bool>>> ResolveFlaggedContent(int flagId, [FromBody] string resolution)
    {
        try
        {
            var adminUserId = GetCurrentUserId();
            if (string.IsNullOrEmpty(adminUserId))
            {
                return Unauthorized(ApiResponse<bool>.ErrorResult("Admin not authenticated"));
            }

            var result = await _adminService.ResolveFlaggedContentAsync(flagId, resolution, adminUserId);
            if (!result)
            {
                return NotFound(ApiResponse<bool>.ErrorResult("Flagged content not found"));
            }

            return Ok(ApiResponse<bool>.SuccessResult(true, "Flagged content resolved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resolving flagged content {FlagId}", flagId);
            return StatusCode(500, ApiResponse<bool>.ErrorResult("Failed to resolve flagged content"));
        }
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}