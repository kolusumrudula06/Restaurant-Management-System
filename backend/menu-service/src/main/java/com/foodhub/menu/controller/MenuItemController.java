package com.foodhub.menu.controller;

import com.foodhub.menu.dto.MenuItemDto;
import com.foodhub.menu.service.MenuItemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "*"})
public class MenuItemController {

    private final MenuItemService service;

    public MenuItemController(MenuItemService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<MenuItemDto>> getAllMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean vegetarianOnly,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean availableOnly) {
        List<MenuItemDto> items = service.getAllMenuItems(category, vegetarianOnly, search, availableOnly);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItemDto> getMenuItemById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getMenuItemById(id));
    }

    @PostMapping
    public ResponseEntity<MenuItemDto> createMenuItem(@Valid @RequestBody MenuItemDto dto) {
        MenuItemDto created = service.createMenuItem(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItemDto> updateMenuItem(@PathVariable Long id, @Valid @RequestBody MenuItemDto dto) {
        return ResponseEntity.ok(service.updateMenuItem(id, dto));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<MenuItemDto> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleAvailability(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        service.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}
