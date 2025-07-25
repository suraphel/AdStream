using AutoMapper;
using EthioMarket.Core.Entities;
using EthioMarket.Application.DTOs;

namespace EthioMarket.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Listings, opt => opt.Ignore())
            .ForMember(dest => dest.Favorites, opt => opt.Ignore());
        CreateMap<UpdateUserDto, User>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Category mappings
        CreateMap<Category, CategoryDto>()
            .ForMember(dest => dest.ListingCount, opt => opt.Ignore())
            .ForMember(dest => dest.Children, opt => opt.MapFrom(src => src.Children));
        CreateMap<CreateCategoryDto, Category>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Parent, opt => opt.Ignore())
            .ForMember(dest => dest.Children, opt => opt.Ignore())
            .ForMember(dest => dest.Listings, opt => opt.Ignore());
        CreateMap<UpdateCategoryDto, Category>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Listing mappings
        CreateMap<Listing, ListingDto>()
            .ForMember(dest => dest.IsFavorited, opt => opt.Ignore());
        CreateMap<CreateListingDto, Listing>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UserId, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Core.Enums.ListingStatus.Active))
            .ForMember(dest => dest.ViewCount, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.Images, opt => opt.Ignore())
            .ForMember(dest => dest.Favorites, opt => opt.Ignore());
        CreateMap<UpdateListingDto, Listing>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // ListingImage mappings
        CreateMap<ListingImage, ListingImageDto>()
            .ForMember(dest => dest.Url, opt => opt.Ignore());

        // Favorite mappings
        CreateMap<Favorite, object>(); // Simple mapping for favorites
    }
}