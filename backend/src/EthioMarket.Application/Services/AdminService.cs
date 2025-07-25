using AutoMapper;
using EthioMarket.Application.DTOs.Admin;
using EthioMarket.Application.DTOs.Common;
using EthioMarket.Core.Entities;
using EthioMarket.Core.Interfaces.Repositories;
using EthioMarket.Core.Enums;

namespace EthioMarket.Application.Services;

public interface IAdminService
{
    Task<AdminDashboardDto> GetDashboardAsync();
    Task<PagedResponse<AdminUserDto>> GetUsersAsync(UserSearchDto searchDto);
    Task<AdminUserDto?> GetUserAsync(string userId);
    Task<bool> UpdateUserRoleAsync(string userId, UpdateUserRoleDto updateDto, string adminUserId);
    Task<bool> SuspendUserAsync(string userId, SuspendUserDto suspendDto, string adminUserId);
    Task<bool> UnsuspendUserAsync(string userId, string adminUserId);
    Task<PagedResponse<AdminListingDto>> GetListingsAsync(AdminListingSearchDto searchDto);
    Task<AdminListingDto?> GetListingAsync(int listingId);
    Task<bool> UpdateListingStatusAsync(int listingId, UpdateListingStatusDto updateDto, string adminUserId);
    Task<bool> FeatureListingAsync(int listingId, FeatureListingDto featureDto, string adminUserId);
    Task<List<FlaggedContentDto>> GetFlaggedContentAsync(int count = 50);
    Task<bool> ResolveFlaggedContentAsync(int flagId, string resolution, string adminUserId);
}

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly IListingRepository _listingRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public AdminService(
        IUserRepository userRepository,
        IListingRepository listingRepository,
        ICategoryRepository categoryRepository,
        IMapper mapper)
    {
        _userRepository = userRepository;
        _listingRepository = listingRepository;
        _categoryRepository = categoryRepository;
        _mapper = mapper;
    }

    public async Task<AdminDashboardDto> GetDashboardAsync()
    {
        var dashboard = new AdminDashboardDto();

        // Get basic stats
        var totalUsers = await GetTotalUsersCountAsync();
        var activeUsers = await GetActiveUsersCountAsync();
        var totalListings = await _listingRepository.GetTotalCountAsync();
        var activeListings = await GetActiveListingsCountAsync();
        var totalCategories = await GetTotalCategoriesCountAsync();

        dashboard.Stats = new DashboardStatsDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            TotalListings = totalListings,
            ActiveListings = activeListings,
            PendingListings = await GetPendingListingsCountAsync(),
            FlaggedListings = await GetFlaggedListingsCountAsync(),
            TotalCategories = totalCategories,
            NewUsersToday = await GetNewUsersTodayCountAsync(),
            NewListingsToday = await GetNewListingsTodayCountAsync()
        };

        // Get recent activities (mocked for now - would come from activity log)
        dashboard.RecentActivities = await GetRecentActivitiesAsync();

        // Get flagged content
        dashboard.FlaggedContent = await GetFlaggedContentAsync(10);

        return dashboard;
    }

    public async Task<PagedResponse<AdminUserDto>> GetUsersAsync(UserSearchDto searchDto)
    {
        // This would be implemented with proper filtering in the repository
        var users = await _userRepository.GetAllAsync(searchDto.Page, searchDto.PageSize);
        var adminUsers = users.Select(u => new AdminUserDto
        {
            Id = u.Id,
            Email = u.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            PhoneNumber = u.PhoneNumber,
            ProfileImageUrl = u.ProfileImageUrl,
            Role = u.Role,
            IsActive = u.IsActive,
            IsEmailVerified = u.IsEmailVerified,
            IsPhoneVerified = u.IsPhoneVerified,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt,
            ListingCount = await _listingRepository.GetCountByUserAsync(u.Id),
            // Other fields would be populated from additional queries or extended user data
        }).ToList();

        var totalCount = await GetTotalUsersCountAsync();
        return PagedResponse<AdminUserDto>.Create(adminUsers, totalCount, searchDto.Page, searchDto.PageSize);
    }

    public async Task<AdminUserDto?> GetUserAsync(string userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return null;

        var adminUser = new AdminUserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = user.PhoneNumber,
            ProfileImageUrl = user.ProfileImageUrl,
            Role = user.Role,
            IsActive = user.IsActive,
            IsEmailVerified = user.IsEmailVerified,
            IsPhoneVerified = user.IsPhoneVerified,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            ListingCount = await _listingRepository.GetCountByUserAsync(user.Id),
        };

        return adminUser;
    }

    public async Task<bool> UpdateUserRoleAsync(string userId, UpdateUserRoleDto updateDto, string adminUserId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        user.Role = updateDto.Role;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        
        // Log admin action (would be implemented with proper activity logging)
        await LogAdminActionAsync(adminUserId, "user_role_updated", $"Updated role for user {userId} to {updateDto.Role}");

        return true;
    }

    public async Task<bool> SuspendUserAsync(string userId, SuspendUserDto suspendDto, string adminUserId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        // Log admin action
        await LogAdminActionAsync(adminUserId, "user_suspended", $"Suspended user {userId}: {suspendDto.Reason}");

        return true;
    }

    public async Task<bool> UnsuspendUserAsync(string userId, string adminUserId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        // Log admin action
        await LogAdminActionAsync(adminUserId, "user_unsuspended", $"Unsuspended user {userId}");

        return true;
    }

    public async Task<PagedResponse<AdminListingDto>> GetListingsAsync(AdminListingSearchDto searchDto)
    {
        var listings = await _listingRepository.GetAllAsync(
            searchDto.Page,
            searchDto.PageSize,
            searchDto.Search,
            searchDto.CategoryId,
            searchDto.Location,
            searchDto.UserId,
            searchDto.Status,
            searchDto.IsFeatured);

        var adminListings = new List<AdminListingDto>();
        foreach (var listing in listings)
        {
            var adminListing = new AdminListingDto
            {
                Id = listing.Id,
                Title = listing.Title,
                TitleAm = listing.TitleAm,
                Description = listing.Description,
                DescriptionAm = listing.DescriptionAm,
                Price = listing.Price,
                Currency = listing.Currency,
                Location = listing.Location,
                LocationAm = listing.LocationAm,
                Condition = listing.Condition,
                Status = listing.Status,
                IsFeatured = listing.IsFeatured,
                IsNegotiable = listing.IsNegotiable,
                ViewCount = listing.ViewCount,
                ExpiresAt = listing.ExpiresAt,
                CreatedAt = listing.CreatedAt,
                UpdatedAt = listing.UpdatedAt,
                UserId = listing.UserId,
                UserName = $"{listing.User?.FirstName} {listing.User?.LastName}".Trim(),
                UserEmail = listing.User?.Email,
                CategoryId = listing.CategoryId,
                CategoryName = listing.Category?.Name,
                CategoryNameAm = listing.Category?.NameAm
            };

            adminListings.Add(adminListing);
        }

        var totalCount = await _listingRepository.GetTotalCountAsync();
        return PagedResponse<AdminListingDto>.Create(adminListings, totalCount, searchDto.Page, searchDto.PageSize);
    }

    public async Task<AdminListingDto?> GetListingAsync(int listingId)
    {
        var listing = await _listingRepository.GetByIdWithDetailsAsync(listingId, true);
        if (listing == null) return null;

        return new AdminListingDto
        {
            Id = listing.Id,
            Title = listing.Title,
            TitleAm = listing.TitleAm,
            Description = listing.Description,
            DescriptionAm = listing.DescriptionAm,
            Price = listing.Price,
            Currency = listing.Currency,
            Location = listing.Location,
            LocationAm = listing.LocationAm,
            Condition = listing.Condition,
            Status = listing.Status,
            IsFeatured = listing.IsFeatured,
            IsNegotiable = listing.IsNegotiable,
            ViewCount = listing.ViewCount,
            ExpiresAt = listing.ExpiresAt,
            CreatedAt = listing.CreatedAt,
            UpdatedAt = listing.UpdatedAt,
            UserId = listing.UserId,
            UserName = $"{listing.User?.FirstName} {listing.User?.LastName}".Trim(),
            UserEmail = listing.User?.Email,
            CategoryId = listing.CategoryId,
            CategoryName = listing.Category?.Name,
            CategoryNameAm = listing.Category?.NameAm
        };
    }

    public async Task<bool> UpdateListingStatusAsync(int listingId, UpdateListingStatusDto updateDto, string adminUserId)
    {
        var listing = await _listingRepository.GetByIdAsync(listingId, true);
        if (listing == null) return false;

        listing.Status = updateDto.Status;
        listing.UpdatedAt = DateTime.UtcNow;

        await _listingRepository.UpdateAsync(listing);

        // Log admin action
        await LogAdminActionAsync(adminUserId, "listing_status_updated", 
            $"Updated status for listing {listingId} to {updateDto.Status}. Reason: {updateDto.Reason}");

        return true;
    }

    public async Task<bool> FeatureListingAsync(int listingId, FeatureListingDto featureDto, string adminUserId)
    {
        var listing = await _listingRepository.GetByIdAsync(listingId, true);
        if (listing == null) return false;

        listing.IsFeatured = featureDto.IsFeatured;
        listing.UpdatedAt = DateTime.UtcNow;

        await _listingRepository.UpdateAsync(listing);

        // Log admin action
        var action = featureDto.IsFeatured ? "featured" : "unfeatured";
        await LogAdminActionAsync(adminUserId, "listing_featured", $"Listing {listingId} {action}");

        return true;
    }

    public async Task<List<FlaggedContentDto>> GetFlaggedContentAsync(int count = 50)
    {
        // Mock implementation - would be replaced with actual flagged content repository
        return new List<FlaggedContentDto>();
    }

    public async Task<bool> ResolveFlaggedContentAsync(int flagId, string resolution, string adminUserId)
    {
        // Mock implementation - would update flagged content status
        await LogAdminActionAsync(adminUserId, "flag_resolved", $"Resolved flag {flagId}: {resolution}");
        return true;
    }

    // Helper methods (would be implemented properly with repositories)
    private async Task<int> GetTotalUsersCountAsync()
    {
        // Would use a dedicated count query in repository
        var users = await _userRepository.GetAllAsync(1, int.MaxValue);
        return users.Count();
    }

    private async Task<int> GetActiveUsersCountAsync()
    {
        var users = await _userRepository.GetAllAsync(1, int.MaxValue);
        return users.Count(u => u.IsActive);
    }

    private async Task<int> GetActiveListingsCountAsync()
    {
        return await _listingRepository.GetTotalCountAsync();
    }

    private async Task<int> GetPendingListingsCountAsync()
    {
        // Mock - would filter by draft status
        return 0;
    }

    private async Task<int> GetFlaggedListingsCountAsync()
    {
        // Mock - would count flagged listings
        return 0;
    }

    private async Task<int> GetTotalCategoriesCountAsync()
    {
        var categories = await _categoryRepository.GetAllAsync();
        return categories.Count();
    }

    private async Task<int> GetNewUsersTodayCountAsync()
    {
        // Mock - would filter by today's date
        return 0;
    }

    private async Task<int> GetNewListingsTodayCountAsync()
    {
        // Mock - would filter by today's date
        return 0;
    }

    private async Task<List<RecentActivityDto>> GetRecentActivitiesAsync()
    {
        // Mock implementation - would come from activity log
        return new List<RecentActivityDto>();
    }

    private async Task LogAdminActionAsync(string adminUserId, string action, string description)
    {
        // Mock implementation - would log to activity table
        await Task.CompletedTask;
    }
}