package com.foodhub.menu.config;

import com.foodhub.menu.entity.MenuItem;
import com.foodhub.menu.repository.MenuItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final MenuItemRepository repository;

    public DataInitializer(MenuItemRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() == 0) {
            List<MenuItem> initialItems = List.of(
                new MenuItem(
                    "Paneer Butter Masala",
                    "Rich and creamy curry made with cottage cheese cubes simmered in a spiced tomato, butter, and cashew sauce.",
                    new BigDecimal("280.00"),
                    "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
                    "Main Course",
                    true,
                    true
                ),
                new MenuItem(
                    "Masala Dosa",
                    "Crispy golden fermented rice & lentil crepe stuffed with spiced potato masala, served with piping hot sambar and fresh chutneys.",
                    new BigDecimal("140.00"),
                    "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
                    "South Indian",
                    true,
                    true
                ),
                new MenuItem(
                    "Chicken Biryani",
                    "Slow-cooked aromatic basmati rice layered with tender marinated chicken pieces, caramelized onions, and authentic royal spices.",
                    new BigDecimal("320.00"),
                    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
                    "Biryani",
                    false,
                    true
                ),
                new MenuItem(
                    "Veg Fried Rice",
                    "Wok-tossed long-grain basmati rice mixed with crunchy garden vegetables, spring onions, and oriental savory seasonings.",
                    new BigDecimal("190.00"),
                    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
                    "Chinese",
                    true,
                    true
                ),
                new MenuItem(
                    "Butter Naan",
                    "Traditional fluffy leavened flatbread freshly baked in a clay tandoor oven, brushed with generous amounts of butter.",
                    new BigDecimal("50.00"),
                    "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80",
                    "Breads",
                    true,
                    true
                ),
                new MenuItem(
                    "Gobi Manchurian",
                    "Crispy batter-fried cauliflower florets glazed in a tangy, spicy, and savory dark soya and garlic Indo-Chinese sauce.",
                    new BigDecimal("210.00"),
                    "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
                    "Starters",
                    true,
                    true
                )
            );

            repository.saveAll(initialItems);
            System.out.println(">>> Seeded 6 FOODHUB signature menu items into menu-service database.");
        }
    }
}
