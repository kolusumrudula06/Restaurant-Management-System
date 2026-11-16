package com.foodhub.order.controller;

import com.foodhub.order.dto.CreateOrderRequest;
import com.foodhub.order.dto.OrderResponse;
import com.foodhub.order.dto.UpdateOrderStatusRequest;
import com.foodhub.order.entity.OrderStatus;
import com.foodhub.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "*"})
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Create a new order with real-time menu validation & server-side price calculation.
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all orders sorted by newest first.
     */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /**
     * Get a specific order by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    /**
     * Get orders for a specific user ID.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByUser(@PathVariable String userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    /**
     * Update order status (PENDING, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED).
     * Accepts either JSON body {"status": "CONFIRMED"} or query parameter ?status=CONFIRMED.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody(required = false) UpdateOrderStatusRequest request,
            @RequestParam(required = false) OrderStatus status) {

        OrderStatus targetStatus = null;
        if (request != null && request.getStatus() != null) {
            targetStatus = request.getStatus();
        } else if (status != null) {
            targetStatus = status;
        }

        if (targetStatus == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(orderService.updateOrderStatus(id, targetStatus));
    }
}
