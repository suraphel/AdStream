using AutoMapper;
using EthioMarket.Application.DTOs;
using EthioMarket.Core.Entities;
using EthioMarket.Core.Interfaces.Repositories;

namespace EthioMarket.Application.Services;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(string id);
    Task<UserDto?> GetByEmailAsync(string email);
    Task<UserDto> CreateAsync(CreateUserDto createUserDto);
    Task<UserDto> UpdateAsync(string id, UpdateUserDto updateUserDto);
    Task<bool> DeleteAsync(string id);
    Task<IEnumerable<UserDto>> GetAllAsync(int page = 1, int pageSize = 20);
    Task<bool> IsEmailAvailableAsync(string email, string? excludeUserId = null);
}

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IMapper _mapper;

    public UserService(IUserRepository userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<UserDto?> GetByIdAsync(string id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user != null ? _mapper.Map<UserDto>(user) : null;
    }

    public async Task<UserDto?> GetByEmailAsync(string email)
    {
        var user = await _userRepository.GetByEmailAsync(email);
        return user != null ? _mapper.Map<UserDto>(user) : null;
    }

    public async Task<UserDto> CreateAsync(CreateUserDto createUserDto)
    {
        var user = _mapper.Map<User>(createUserDto);
        user.Id = Guid.NewGuid().ToString();
        
        var createdUser = await _userRepository.CreateAsync(user);
        return _mapper.Map<UserDto>(createdUser);
    }

    public async Task<UserDto> UpdateAsync(string id, UpdateUserDto updateUserDto)
    {
        var existingUser = await _userRepository.GetByIdAsync(id);
        if (existingUser == null)
            throw new ArgumentException("User not found", nameof(id));

        _mapper.Map(updateUserDto, existingUser);
        existingUser.UpdatedAt = DateTime.UtcNow;

        var updatedUser = await _userRepository.UpdateAsync(existingUser);
        return _mapper.Map<UserDto>(updatedUser);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        return await _userRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync(int page = 1, int pageSize = 20)
    {
        var users = await _userRepository.GetAllAsync(page, pageSize);
        return _mapper.Map<IEnumerable<UserDto>>(users);
    }

    public async Task<bool> IsEmailAvailableAsync(string email, string? excludeUserId = null)
    {
        return !await _userRepository.IsEmailTakenAsync(email, excludeUserId);
    }
}