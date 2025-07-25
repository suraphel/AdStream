using AutoMapper;
using EthioMarket.Application.DTOs;
using EthioMarket.Application.DTOs.Common;
using EthioMarket.Core.Entities;
using EthioMarket.Core.Interfaces.Repositories;
using EthioMarket.Core.Interfaces.Services;
using EthioMarket.Core.Enums;

namespace EthioMarket.Application.Services;

public interface IListingService
{
    Task<ListingDto?> GetByIdAsync(int id, string? currentUserId = null);
    Task<PagedResponse<ListingDto>> GetAllAsync(ListingSearchDto searchDto, string? currentUserId = null);
    Task<PagedResponse<ListingDto>> GetByUserIdAsync(string userId, int page = 1, int pageSize = 20);
    Task<IEnumerable<ListingDto>> GetFeaturedAsync(int count = 10, string? currentUserId = null);
    Task<IEnumerable<ListingDto>> GetRecentAsync(int count = 10, string? currentUserId = null);
    Task<ListingDto> CreateAsync(CreateListingDto createListingDto, string userId);
    Task<ListingDto> UpdateAsync(int id, UpdateListingDto updateListingDto, string userId);
    Task<bool> DeleteAsync(int id, string userId);
    Task<bool> IncrementViewCountAsync(int id);
}

public class ListingService : IListingService
{
    private readonly IListingRepository _listingRepository;
    private readonly IFavoriteRepository _favoriteRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IStorageService _storageService;
    private readonly IMapper _mapper;

    public ListingService(
        IListingRepository listingRepository,
        IFavoriteRepository favoriteRepository,
        ICategoryRepository categoryRepository,
        IStorageService storageService,
        IMapper mapper)
    {
        _listingRepository = listingRepository;
        _favoriteRepository = favoriteRepository;
        _categoryRepository = categoryRepository;
        _storageService = storageService;
        _mapper = mapper;
    }

    public async Task<ListingDto?> GetByIdAsync(int id, string? currentUserId = null)
    {
        var listing = await _listingRepository.GetByIdWithDetailsAsync(id);
        if (listing == null) return null;

        var listingDto = _mapper.Map<ListingDto>(listing);
        
        // Check if current user has favorited this listing
        if (!string.IsNullOrEmpty(currentUserId))
        {
            listingDto.IsFavorited = await _favoriteRepository.ExistsAsync(currentUserId, id);
        }

        // Generate image URLs
        foreach (var image in listingDto.Images)
        {
            image.Url = await _storageService.GetFileUrlAsync(image.StoragePath);
        }

        return listingDto;
    }

    public async Task<PagedResponse<ListingDto>> GetAllAsync(ListingSearchDto searchDto, string? currentUserId = null)
    {
        var listings = await _listingRepository.GetAllAsync(
            searchDto.Page,
            searchDto.PageSize,
            searchDto.Search,
            searchDto.CategoryId,
            searchDto.Location,
            null, // userId filter
            null, // status filter (default to active)
            searchDto.IsFeatured);

        var listingDtos = new List<ListingDto>();
        
        foreach (var listing in listings)
        {
            var listingDto = _mapper.Map<ListingDto>(listing);
            
            // Check if current user has favorited this listing
            if (!string.IsNullOrEmpty(currentUserId))
            {
                listingDto.IsFavorited = await _favoriteRepository.ExistsAsync(currentUserId, listing.Id);
            }

            // Generate image URLs
            foreach (var image in listingDto.Images)
            {
                image.Url = await _storageService.GetFileUrlAsync(image.StoragePath);
            }

            listingDtos.Add(listingDto);
        }

        var totalCount = await _listingRepository.GetTotalCountAsync();
        
        return PagedResponse<ListingDto>.Create(listingDtos, totalCount, searchDto.Page, searchDto.PageSize);
    }

    public async Task<PagedResponse<ListingDto>> GetByUserIdAsync(string userId, int page = 1, int pageSize = 20)
    {
        var listings = await _listingRepository.GetByUserIdAsync(userId, page, pageSize);
        var listingDtos = new List<ListingDto>();
        
        foreach (var listing in listings)
        {
            var listingDto = _mapper.Map<ListingDto>(listing);
            
            // Generate image URLs
            foreach (var image in listingDto.Images)
            {
                image.Url = await _storageService.GetFileUrlAsync(image.StoragePath);
            }

            listingDtos.Add(listingDto);
        }

        var totalCount = await _listingRepository.GetCountByUserAsync(userId);
        
        return PagedResponse<ListingDto>.Create(listingDtos, totalCount, page, pageSize);
    }

    public async Task<IEnumerable<ListingDto>> GetFeaturedAsync(int count = 10, string? currentUserId = null)
    {
        var listings = await _listingRepository.GetFeaturedAsync(count);
        var listingDtos = new List<ListingDto>();
        
        foreach (var listing in listings)
        {
            var listingDto = _mapper.Map<ListingDto>(listing);
            
            // Check if current user has favorited this listing
            if (!string.IsNullOrEmpty(currentUserId))
            {
                listingDto.IsFavorited = await _favoriteRepository.ExistsAsync(currentUserId, listing.Id);
            }

            // Generate image URLs
            foreach (var image in listingDto.Images)
            {
                image.Url = await _storageService.GetFileUrlAsync(image.StoragePath);
            }

            listingDtos.Add(listingDto);
        }

        return listingDtos;
    }

    public async Task<IEnumerable<ListingDto>> GetRecentAsync(int count = 10, string? currentUserId = null)
    {
        var listings = await _listingRepository.GetRecentAsync(count);
        var listingDtos = new List<ListingDto>();
        
        foreach (var listing in listings)
        {
            var listingDto = _mapper.Map<ListingDto>(listing);
            
            // Check if current user has favorited this listing
            if (!string.IsNullOrEmpty(currentUserId))
            {
                listingDto.IsFavorited = await _favoriteRepository.ExistsAsync(currentUserId, listing.Id);
            }

            // Generate image URLs
            foreach (var image in listingDto.Images)
            {
                image.Url = await _storageService.GetFileUrlAsync(image.StoragePath);
            }

            listingDtos.Add(listingDto);
        }

        return listingDtos;
    }

    public async Task<ListingDto> CreateAsync(CreateListingDto createListingDto, string userId)
    {
        // Validate category exists
        var category = await _categoryRepository.GetByIdAsync(createListingDto.CategoryId);
        if (category == null)
            throw new ArgumentException("Category not found", nameof(createListingDto.CategoryId));

        var listing = _mapper.Map<Listing>(createListingDto);
        listing.UserId = userId;
        listing.CreatedAt = DateTime.UtcNow;
        listing.UpdatedAt = DateTime.UtcNow;

        var createdListing = await _listingRepository.CreateAsync(listing);
        return _mapper.Map<ListingDto>(createdListing);
    }

    public async Task<ListingDto> UpdateAsync(int id, UpdateListingDto updateListingDto, string userId)
    {
        var existingListing = await _listingRepository.GetByIdAsync(id, true);
        if (existingListing == null)
            throw new ArgumentException("Listing not found", nameof(id));

        if (existingListing.UserId != userId)
            throw new UnauthorizedAccessException("You can only update your own listings");

        // Validate category if provided
        if (updateListingDto.CategoryId.HasValue)
        {
            var category = await _categoryRepository.GetByIdAsync(updateListingDto.CategoryId.Value);
            if (category == null)
                throw new ArgumentException("Category not found", nameof(updateListingDto.CategoryId));
        }

        _mapper.Map(updateListingDto, existingListing);
        existingListing.UpdatedAt = DateTime.UtcNow;

        var updatedListing = await _listingRepository.UpdateAsync(existingListing);
        return _mapper.Map<ListingDto>(updatedListing);
    }

    public async Task<bool> DeleteAsync(int id, string userId)
    {
        var listing = await _listingRepository.GetByIdAsync(id, true);
        if (listing == null) return false;

        if (listing.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own listings");

        return await _listingRepository.DeleteAsync(id);
    }

    public async Task<bool> IncrementViewCountAsync(int id)
    {
        return await _listingRepository.IncrementViewCountAsync(id);
    }
}