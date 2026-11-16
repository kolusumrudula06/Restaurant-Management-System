package com.foodhub.order.client;

import com.foodhub.order.dto.MenuItemClientDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.util.Optional;

@Component
public class MenuServiceClient {

    private static final Logger log = LoggerFactory.getLogger(MenuServiceClient.class);
    private final RestClient restClient;
    private final String menuServiceUrl;

    public MenuServiceClient(@Value("${services.menu-service.url:http://localhost:8081}") String menuServiceUrl) {
        this.menuServiceUrl = menuServiceUrl;
        this.restClient = RestClient.builder()
                .baseUrl(menuServiceUrl)
                .build();
        log.info("Configured MenuServiceClient targeting: {}", menuServiceUrl);
    }

    /**
     * Calls menu-service GET /api/menu/{id} to validate item existence, availability, and authentic price.
     */
    public Optional<MenuItemClientDto> getMenuItemById(Long menuItemId) {
        try {
            MenuItemClientDto item = restClient.get()
                    .uri("/api/menu/{id}", menuItemId)
                    .retrieve()
                    .body(MenuItemClientDto.class);
            return Optional.ofNullable(item);
        } catch (HttpClientErrorException.NotFound ex) {
            log.warn("Menu item with ID {} not found in menu-service", menuItemId);
            return Optional.empty();
        } catch (Exception ex) {
            log.error("Failed to reach menu-service at {}: {}", menuServiceUrl, ex.getMessage());
            throw new IllegalStateException("Menu service is currently unavailable: " + ex.getMessage(), ex);
        }
    }
}
