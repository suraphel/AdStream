using EthioMarket.Core.Enums;

namespace EthioMarket.Application.DTOs.Admin;

public class AdminUserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public UserRole Role { get; set; }
    public bool IsActive { get; set; }
    public bool IsEmailVerified { get; set; }
    public bool IsPhoneVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
    
    // Additional admin fields
    public int ListingCount { get; set; }
    public int FavoriteCount { get; set; }
    public bool IsSuspended { get; set; }
    public string? SuspensionReason { get; set; }
    public DateTime? SuspensionExpiry { get; set; }
}

public class UpdateUserRoleDto
{
    public UserRole Role { get; set; }
    public string? Reason { get; set; }
}

public class SuspendUserDto
{
    public string Reason { get; set; } = string.Empty;
    public string ReasonAm { get; set; } = string.Empty;
    public DateTime? ExpiryDate { get; set; }
    public bool IsPermanent { get; set; } = false;
}

public class UserSearchDto
{
    public string? Search { get; set; }
    public UserRole? Role { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsVerified { get; set; }
    public bool? IsSuspended { get; set; }
    public DateTime? CreatedAfter { get; set; }
    public DateTime? CreatedBefore { get; set; }
    public string? SortBy { get; set; } = "recent";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}