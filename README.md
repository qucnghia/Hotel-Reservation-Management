# 🏨 Hệ Thống Quản Lý Khách Sạn (Hotel Management System)

> Ứng dụng Fullstack hiện đại quản lý vận hành khách sạn, xây dựng trên nền tảng **Spring Boot 4 (Java 21)** và **React 19 (Vite + Tailwind CSS v4)**, áp dụng các nguyên lý **Lập trình Hướng đối tượng (OOP)** và hỗ trợ linh hoạt **Giao diện Sáng / Tối (Light / Dark Mode)**.

---

## 📋 Mục Lục
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Tính Năng Chính](#-tính-năng-chính)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Hướng Dẫn Khởi Chạy Nhanh](#-hướng-dẫn-khởi-chạy-nhanh)
- [Danh Sách RESTful API](#-danh-sách-restful-api)
- [Tài Liệu Thiết Kế](#-tài-liệu-thiết-kế)

---

## 🛠 Công Nghệ Sử Dụng

| Tầng (Layer) | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Backend** | Java 21, Spring Boot 4.1.x | Spring Web, Spring Data JPA, Hibernate, Maven |
| **Cơ sở dữ liệu** | MySQL 8.0+ | Tự động sinh bảng dữ liệu qua Hibernate DDL |
| **Frontend** | React 19, Vite 8 | Tailwind CSS v4, Hugeicons, Canvas SVG |
| **Kiến trúc OOP** | Đóng gói, Kế thừa, Đa hình | `Room` $\rightarrow$ `StandardRoom`, `VipRoom`, `LuxuryRoom`; DTO Pattern |

---

## ✨ Tính Năng Chính

* **👥 Quản Lý Khách Hàng**: Thêm, sửa, xóa, tìm kiếm hồ sơ và xem lịch sử các đơn đặt phòng của từng khách hàng.
* **🚪 Quản Lý Phòng Nghỉ**: Phân loại theo hạng (`STANDARD`, `VIP`, `LUXURY`), tiện ích và giá đêm. Tự động chuyển đổi trạng thái (`AVAILABLE` $\leftrightarrow$ `OCCUPIED`).
* **🗺️ Sơ Đồ Mặt Bằng 2D (Hotel Floor Plan)**: Trực quan hóa sơ đồ tầng lầu, trạng thái phòng theo thời gian thực và đồ họa nội thất 2D.
* **📅 Đặt Phòng & Chống Trùng Lịch**: Tự động tính số đêm và tổng tiền, kiểm tra xung đột thời gian (Date-Range Overlap Check) qua truy vấn JPQL.
* **📊 Quản Lý Doanh Thu & Sổ Quỹ (Revenue Ledger)**:
  - Phân tích chỉ số tài chính: Doanh thu thực nhận, Doanh thu chờ, ADR (Giá bình quân/đêm), RevPAR.
  - Sổ nhật ký dòng tiền chi tiết kèm bộ lọc đa năng (tìm kiếm, trạng thái, hạng phòng).
* **🌓 Chuyển Đổi Giao Diện Sáng / Tối**: Tùy chọn giao diện Light/Dark Mode tương thích mượt mà, độ tương phản cao.

---

## 📂 Cấu Trúc Dự Án

```text
HotelManagement/
├── backend/                                   # Mã nguồn Backend (Spring Boot 4 + Java 21)
│   ├── src/main/java/in/app/hotelmanagement/
│   │   ├── controller/                        # Tầng REST Controller điều hướng HTTP requests
│   │   │   ├── CustomerController.java        # API quản lý hồ sơ khách hàng (/hotel/customers)
│   │   │   ├── RoomController.java            # API quản lý phòng nghỉ (/hotel/rooms)
│   │   │   └── BookingController.java         # API đặt phòng & chuyển trạng thái (/hotel/bookings)
│   │   ├── service/                           # Tầng nghiệp vụ xử lý logic (Business Services)
│   │   │   ├── CustomerService.java           # Xử lý thông tin & lịch sử khách hàng
│   │   │   ├── RoomService.java               # Xử lý danh mục & trạng thái phòng
│   │   │   └── BookingService.java            # Tính toán đêm/tiền, kiểm tra xung đột trùng lịch
│   │   ├── repository/                        # Tầng truy xuất dữ liệu Spring Data JPA
│   │   │   ├── CustomerRepository.java        # Tìm kiếm khách hàng theo Phone, CCCD, Email
│   │   │   ├── RoomRepository.java            # Tìm kiếm phòng theo số phòng, trạng thái
│   │   │   └── BookingRepository.java         # Truy vấn JPQL chặn việc đặt phòng trùng ngày
│   │   ├── entity/                            # Tầng thực thể cơ sở dữ liệu (JPA Entities)
│   │   │   ├── Customer.java                  # Thực thể khách hàng
│   │   │   ├── Booking.java                   # Thực thể đơn đặt phòng (@ManyToOne liên kết)
│   │   │   └── room/                          # Cấu trúc Kế thừa OOP cho phòng nghỉ
│   │   │       ├── Room.java                  # Lớp cha trừu tượng (Base Room Entity)
│   │   │       ├── StandardRoom.java          # Hạng phòng tiêu chuẩn
│   │   │       ├── VipRoom.java               # Hạng phòng VIP (Bồn tắm, view đẹp, minibar)
│   │   │       └── LuxuryRoom.java            # Hạng phòng Tổng thống (Dịch vụ cao cấp nhất)
│   │   ├── dto/                               # Data Transfer Objects (Đóng gói an toàn dữ liệu)
│   │   │   ├── customerDTO/                   # CustomerRequest, CustomerResponse
│   │   │   ├── roomDTO/                       # RoomRequest, RoomResponse
│   │   │   ├── bookingDTO/                    # BookingRequest, BookingResponse
│   │   │   └── CustomerBookingHistoryResponse.java
│   │   ├── enums/                             # Định nghĩa các hằng số trạng thái
│   │   │   ├── RoomType.java                  # STANDARD, VIP, LUXURY
│   │   │   ├── RoomStatus.java                # AVAILABLE, OCCUPIED, MAINTENANCE
│   │   │   ├── BookingStatus.java             # CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
│   │   │   └── CustomerMembership.java        # Hạng thành viên khách hàng
│   │   ├── exception/                         # Xử lý ngoại lệ tập trung (Global Exception Handling)
│   │   │   ├── GlobalExceptionHandler.java    # Bắt lỗi toàn cục, trả về format JSON chuẩn
│   │   │   ├── ResourceNotFoundException.java
│   │   │   ├── DuplicateResourceException.java
│   │   │   └── InvalidBookingException.java
│   │   └── HotelManagementApplication.java    # Điểm khởi động ứng dụng Spring Boot
│   ├── src/main/resources/
│   │   └── application.properties             # Cấu hình Cổng 8080, MySQL, Hibernate DDL
│   ├── mvnw / mvnw.cmd                        # Maven Wrapper (chạy dự án không cần cài Maven)
│   └── pom.xml                                # Khai báo dependencies Maven (Spring, JPA, MySQL)
│
├── frontend/                                  # Mã nguồn Frontend (React 19 + Vite 8 + Tailwind v4)
│   ├── public/                                # Logo thương hiệu & tài nguyên tĩnh
│   │   ├── hotel-building-logo.png            # Logo toà nhà khách sạn cao cấp
│   │   └── hotel-logo-original.png
│   ├── src/
│   │   ├── components/                        # Các UI Components nghiệp vụ
│   │   │   ├── booking-history/               # Modal xem lịch sử đặt phòng của khách hàng
│   │   │   │   └── CustomerBookingHistoryModal.jsx
│   │   │   ├── floor-plan/                    # Sơ đồ mặt bằng 2D & mô phỏng phòng khách sạn
│   │   │   │   └── HotelFloorPlan2D.jsx       # Mặt bằng 2D, đồ họa giường ngủ, thẻ RFID cửa
│   │   │   ├── revenue/                       # Quản lý Doanh thu & Sổ quỹ tài chính
│   │   │   │   └── RevenueManagement.jsx      # Biểu đồ SVG, RevPAR, ADR, Sổ nhật ký dòng tiền
│   │   │   ├── form/                          # Các form thêm/sửa dữ liệu
│   │   │   │   ├── BookingForm.jsx            # Form tạo đơn đặt phòng mới
│   │   │   │   ├── CustomerForm.jsx           # Form thêm/sửa khách hàng
│   │   │   │   └── RoomForm.jsx               # Form thêm/sửa phòng nghỉ
│   │   │   ├── table/                         # Các bảng dữ liệu hiển thị danh sách
│   │   │   │   ├── BookingTable.jsx           # Bảng quản lý đơn đặt & chuyển trạng thái
│   │   │   │   ├── CustomerTable.jsx          # Bảng danh sách khách hàng
│   │   │   │   └── RoomTable.jsx              # Bảng danh mục phòng nghỉ
│   │   │   ├── date-picker/                   # Bộ chọn ngày đặt phòng tùy chỉnh
│   │   │   │   └── CustomDatePicker.jsx
│   │   │   ├── glide-select/                  # Dropdown chọn tùy chọn mượt mà
│   │   │   │   └── GlideSelect.jsx
│   │   │   ├── theme/                         # Bộ chuyển đổi giao diện Sáng / Tối
│   │   │   │   └── ThemeToggle.jsx
│   │   │   ├── icons/                         # Bộ biểu tượng SVG vector đồng bộ
│   │   │   │   └── Icons.jsx
│   │   │   └── index.js                       # Barrel export duy nhất của components
│   │   ├── services/                          # Tầng gọi API Backend qua Axios
│   │   │   ├── customerService.js             # API khách hàng
│   │   │   ├── roomService.js                 # API phòng nghỉ
│   │   │   └── bookingService.js              # API đơn đặt phòng
│   │   ├── App.jsx                            # Giao diện chính điều hướng Tabs & Sidebar
│   │   ├── index.css                          # Cấu hình Tailwind CSS v4, Dark/Light mode theme
│   │   └── main.jsx                           # Entry point React DOM
│   ├── index.html                             # File HTML gốc nạp font Google Fonts
│   ├── vite.config.js                         # Cấu hình máy chủ phát triển Vite
│   └── package.json                           # Khai báo các thư viện npm Frontend
│
├── docs/                                      # Tài liệu dự án
│   └── design-system/                         # Quy chuẩn hệ thống thiết kế UI/UX
│       └── MASTER.md                          # Bảng màu, typography, CSS tokens của khách sạn
└── README.md                                  # Tài liệu hướng dẫn dự án
```

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh

### 1. Yêu Cầu Cài Đặt
* **JDK 21 trở lên** | **Node.js v18+** | **MySQL 8.0+**

### 2. Thiết Lập Cơ Sở Dữ Liệu
1. Mở MySQL Client và tạo database:
   ```sql
   CREATE DATABASE IF NOT EXISTS hotels CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Đặt mật khẩu MySQL qua biến môi trường `DB_PASSWORD` (tuỳ chọn `DB_USERNAME`, mặc định `root`) trước khi chạy backend:
   ```bash
   # Windows PowerShell:
   $env:DB_PASSWORD="MẬT_KHẨU_MYSQL_CỦA_BẠN"
   # macOS / Linux:
   export DB_PASSWORD="MẬT_KHẨU_MYSQL_CỦA_BẠN"
   ```
   Khi chạy bằng IntelliJ, thêm `DB_PASSWORD` vào mục *Environment variables* của Run Configuration.

### 3. Chạy Backend (Port 8080)
```bash
cd backend
# Windows:
.\mvnw.cmd spring-boot:run
# macOS / Linux:
./mvnw spring-boot:run
```

### 4. Chạy Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
Truy cập ứng dụng tại: **http://localhost:5173**

---

## 📡 Danh Sách RESTful API

Địa chỉ gốc: `http://localhost:8080/hotel`

| Nhóm | Method | Endpoint | Mô tả |
| :--- | :--- | :--- | :--- |
| **Khách Hàng** | `GET`, `POST` | `/hotel/customers` | Lấy danh sách / Thêm mới khách hàng |
| | `GET`, `PUT`, `DELETE` | `/hotel/customers/{id}` | Chi tiết / Cập nhật / Xóa khách hàng |
| **Phòng** | `GET`, `POST` | `/hotel/rooms` | Lấy danh sách / Thêm phòng |
| | `GET`, `PUT`, `DELETE` | `/hotel/rooms/{id}` | Chi tiết / Cập nhật / Xóa phòng |
| **Đặt Phòng** | `GET`, `POST` | `/hotel/bookings` | Lấy danh sách / Tạo đơn đặt phòng |
| | `GET`, `PUT`, `DELETE` | `/hotel/bookings/{id}` | Chi tiết / Cập nhật / Hủy đơn đặt |
| | `PATCH` | `/hotel/bookings/{id}/status` | Cập nhật trạng thái (`CHECKED_IN`, `CHECKED_OUT`...) |

---

## 🎨 Tài Liệu Thiết Kế
Quy chuẩn thiết kế giao diện (Bảng màu, typography, CSS tokens) được lưu trữ tại [docs/design-system/MASTER.md](docs/design-system/MASTER.md).
