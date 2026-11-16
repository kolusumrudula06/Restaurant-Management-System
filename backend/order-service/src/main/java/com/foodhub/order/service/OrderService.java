package com.foodhub.order.service;

import com.foodhub.order.client.MenuServiceClient;
import com.foodhub.order.dto.*;
import com.foodhub.order.entity.Order;
import com.foodhub.order.entity.OrderItem;
import com.foodhub.order.entity.OrderStatus;
import com.foodhub.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final MenuServiceClient menuServiceClient;

    @Value("${foodhub.tax-rate:0.05}")
    private BigDecimal taxRate;

    @Value("${foodhub.delivery-fee:30.00}")
    private BigDecimal defaultDeliveryFee;

    public OrderService(OrderRepository orderRepository, MenuServiceClient menuServiceClient) {
        this.orderRepository = orderRepository;
        this.menuServiceClient = menuServiceClient;
    }

    /**
     * Creates an order with real-time price & availability verification against menu-service.
     */
    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Received create order request for customer: {}", request.getCustomerName());

        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setCustomerName(request.getCustomerName().trim());
        order.setPhone(request.getPhone().trim());
        order.setDeliveryAddress(request.getDeliveryAddress().trim());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH_ON_DELIVERY");
        order.setStatus(OrderStatus.PENDING);

        BigDecimal calculatedSubtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItemClientDto menuItem = menuServiceClient.getMenuItemById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Menu item with ID " + itemReq.getMenuItemId() + " does not exist in the menu"
                    ));

            if (!menuItem.isAvailable()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Item '" + menuItem.getName() + "' (ID: " + menuItem.getId() + ") is currently sold out and unavailable"
                );
            }

            BigDecimal unitPrice = menuItem.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            calculatedSubtotal = calculatedSubtotal.add(lineTotal);

            OrderItem orderItem = new OrderItem(
                    menuItem.getId(),
                    menuItem.getName(),
                    itemReq.getQuantity(),
                    unitPrice,
                    lineTotal
            );

            order.addItem(orderItem);
        }

        calculatedSubtotal = calculatedSubtotal.setScale(2, RoundingMode.HALF_UP);
        BigDecimal tax = calculatedSubtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal deliveryFee = defaultDeliveryFee.setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = calculatedSubtotal.add(tax).add(deliveryFee).setScale(2, RoundingMode.HALF_UP);

        order.setSubtotal(calculatedSubtotal);
        order.setTax(tax);
        order.setDeliveryFee(deliveryFee);
        order.setTotal(total);

        Order savedOrder = orderRepository.save(order);
        log.info("Successfully created order ID: {} with total: ₹{}", savedOrder.getId(), savedOrder.getTotal());

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found with ID: " + id));
        return mapToResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse updateOrderStatus(Long id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found with ID: " + id));

        log.info("Updating order ID {} status from {} to {}", id, order.getStatus(), newStatus);
        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);
        return mapToResponse(updated);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getMenuItemId(),
                        item.getItemName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getLineTotal()
                ))
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getCustomerName(),
                order.getPhone(),
                order.getDeliveryAddress(),
                order.getSubtotal(),
                order.getTax(),
                order.getDeliveryFee(),
                order.getTotal(),
                order.getPaymentMethod(),
                order.getStatus(),
                order.getCreatedAt(),
                itemResponses
        );
    }
}
