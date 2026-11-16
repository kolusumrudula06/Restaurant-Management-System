# FOODHUB Microservices Backend

Welcome to the **FOODHUB** Spring Boot backend microservices ecosystem. This architecture decouples restaurant operations into autonomous, resilient services.

---

## Architecture Overview

```mermaid
graph TD
    UI["Frontend (React + Vite)\nhttp://localhost:5173"]
    MS["Menu Service\n(Spring Boot - Port 8081)\nDatabase: menudb (H2)"]
    OS["Order Service\n(Spring Boot - Port 8082)\nDatabase: orderdb (H2)"]

    UI -->|Browse Dishes| MS
    UI -->|Place Orders| OS
    OS -->|REST Validation & Pricing\nGET /api/menu/{id}| MS
```

| Microservice | Port | Description | In-Memory Database |
| :--- | :---: | :--- | :--- |
| **`menu-service`** | `8081` | Manages menu catalog, categories, pricing, availability toggles, and search. Pre-seeds authentic dishes on boot. | `jdbc:h2:mem:menudb` |
| **`order-service`** | `8082` | Processes customer orders, invokes `menu-service` via REST to verify prices and stock (prevents tampering), computes 5% GST and ₹30 delivery fee, and tracks order statuses. | `jdbc:h2:mem:orderdb` |

---

## Commands to Run Backend Services

Open **two separate terminal / command prompt windows** from the project root `c:\Users\Khabe\OneDrive\Desktop\Foodhub`:

### Terminal 1: Run Menu Service (Port 8081)
```bash
cd backend/menu-service
mvn spring-boot:run
```
*(On startup, 6 authentic Indian dishes are automatically seeded into the database)*

---

### Terminal 2: Run Order Service (Port 8082)
```bash
cd backend/order-service
mvn spring-boot:run
```
*(Order service connects to Menu Service at `http://localhost:8081`)*

---

## Convenient Batch Scripts (One-Click)

From the project root or Windows Explorer:
- Double-click or run `backend\run-menu-service.bat`
- Double-click or run `backend\run-order-service.bat`
- Or run `backend\run-all.bat` to launch both services in dedicated console windows.

---

## REST API Endpoints & Testing

### 1. Menu Service (`http://localhost:8081`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/menu` | List all menu items (Supports query params: `category`, `vegetarianOnly`, `search`, `availableOnly`) |
| `GET` | `/api/menu/{id}` | Get dish by ID |
| `POST` | `/api/menu` | Create a new dish |
| `PUT` | `/api/menu/{id}` | Update dish details |
| `PATCH` | `/api/menu/{id}/availability` | Toggle in-stock / sold-out status |
| `DELETE` | `/api/menu/{id}` | Delete dish |

#### Sample cURL (Fetch Menu):
```bash
curl http://localhost:8081/api/menu
```

---

### 2. Order Service (`http://localhost:8082`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/orders` | Place a new order (Validates item IDs & prices with `menu-service`) |
| `GET` | `/api/orders` | Get all orders (newest first) |
| `GET` | `/api/orders/{id}` | Get order details by ID |
| `GET` | `/api/orders/user/{userId}` | Get order history for a specific user |
| `PATCH` | `/api/orders/{id}/status` | Update order status (`CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) |

#### Sample cURL (Place Order):
```bash
curl -X POST http://localhost:8082/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "customerName": "Khabeer Shaik",
    "phone": "9876543210",
    "deliveryAddress": "Flat 402, Green Meadows, Hyderabad",
    "paymentMethod": "CASH_ON_DELIVERY",
    "items": [
      { "menuItemId": 1, "quantity": 2 },
      { "menuItemId": 6, "quantity": 1 }
    ]
  }'
```

---

## H2 Database Consoles

Both services provide interactive web-based database management consoles:

- **Menu Service Console**: `http://localhost:8081/h2-console`
  - JDBC URL: `jdbc:h2:mem:menudb`
  - User Name: `sa`
  - Password: *(leave blank)*

- **Order Service Console**: `http://localhost:8082/h2-console`
  - JDBC URL: `jdbc:h2:mem:orderdb`
  - User Name: `sa`
  - Password: *(leave blank)*
