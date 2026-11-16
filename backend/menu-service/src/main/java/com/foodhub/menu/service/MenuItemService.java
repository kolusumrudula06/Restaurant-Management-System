package com.foodhub.menu.service;

import com.foodhub.menu.dto.MenuItemDto;
import com.foodhub.menu.entity.MenuItem;
import com.foodhub.menu.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MenuItemService {

    private final MenuItemRepository repository;

    public MenuItemService(MenuItemRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<MenuItemDto> getAllMenuItems(String category, Boolean vegetarianOnly, String search, boolean availableOnly) {
        List<MenuItem> items;

        if (search != null && !search.trim().isEmpty()) {
            items = repository.searchMenu(search.trim());
        } else if (category != null && !category.equalsIgnoreCase("All") && !category.trim().isEmpty()) {
            items = repository.findByCategoryIgnoreCase(category.trim());
        } else if (vegetarianOnly != null && vegetarianOnly) {
            items = repository.findByIsVegetarian(true);
        } else if (availableOnly) {
            items = repository.findByIsAvailableTrue();
        } else {
            items = repository.findAll();
        }

        return items.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MenuItemDto getMenuItemById(Long id) {
        MenuItem item = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + id));
        return toDto(item);
    }

    public MenuItemDto createMenuItem(MenuItemDto dto) {
        MenuItem item = toEntity(dto);
        MenuItem saved = repository.save(item);
        return toDto(saved);
    }

    public MenuItemDto updateMenuItem(Long id, MenuItemDto dto) {
        MenuItem existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + id));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setImageUrl(dto.getImageUrl());
        existing.setCategory(dto.getCategory());
        existing.setVegetarian(dto.isVegetarian());
        existing.setAvailable(dto.isAvailable());

        MenuItem updated = repository.save(existing);
        return toDto(updated);
    }

    public MenuItemDto toggleAvailability(Long id) {
        MenuItem existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + id));
        existing.setAvailable(!existing.isAvailable());
        return toDto(repository.save(existing));
    }

    public void deleteMenuItem(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Menu item not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private MenuItemDto toDto(MenuItem entity) {
        return new MenuItemDto(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getPrice(),
                entity.getImageUrl(),
                entity.getCategory(),
                entity.isVegetarian(),
                entity.isAvailable()
        );
    }

    private MenuItem toEntity(MenuItemDto dto) {
        return new MenuItem(
                dto.getName(),
                dto.getDescription(),
                dto.getPrice(),
                dto.getImageUrl(),
                dto.getCategory(),
                dto.isVegetarian(),
                dto.isAvailable()
        );
    }
}
