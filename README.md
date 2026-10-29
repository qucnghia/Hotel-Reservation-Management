# 🏨 Hệ Thống Quản Lý Khách Sạn (Hotel Management System)

> Ứng dụng Fullstack hiện đại quản lý vận hành khách sạn toàn diện, xây dựng trên nền tảng **Spring Boot 4 (Java 21)** và **React 19 (Vite + Tailwind CSS v4)**, áp dụng các nguyên lý **Lập trình Hướng đối tượng (OOP)** chuyên sâu, hỗ trợ linh hoạt **Giao diện Sáng / Tối (Light / Dark Mode)** và in ấn hóa đơn chuẩn hóa.

---

## 📋 Mục Lục
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Hướng Dẫn Khởi Chạy Nhanh](#-hướng-dẫn-khởi-chạy-nhanh)
- [Danh Sách RESTful API](#-danh-sách-restful-api)
- [Tài Liệu Thiết Kế](#-tài-liệu-thiết-kế)

---

## 🛠 Công Nghệ Sử Dụng

| Tầng (Layer) | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Backend** | Java 21, Spring Boot 4.1.x | Spring Web, Spring Data JPA, Hibernate, Bean Validation, Maven |
| **Cơ sở dữ liệu** | MySQL 8.0+ | Tự động đồng bộ lược đồ dữ liệu qua Hibernate DDL |
| **Frontend** | React 19, Vite 8 | Tailwind CSS v4, Lucide / Hugeicons, GlideSelect, SVG Canvas |
| **Kiến trúc OOP** | Đóng gói, Kế thừa, Đa hình | • Hạng phòng: `Room` $\rightarrow$ `StandardRoom`, `VipRoom`, `LuxuryRoom`<br>• Đa hình giá dịch vụ: `ServiceCharge` $\rightarrow$ `PerNightCharge`, `PerItemCharge`<br>• Luồng thanh toán: `Payment` (Deposit, Full, Partial, Refund)<br>• Phân tầng DTO Pattern, Repository Pattern |

---

## ✨ Tính Năng Nổi Bật

* **👥 Quản Lý Hồ Sơ Khách Hàng**: Thêm, sửa, xóa, tìm kiếm hồ sơ theo Họ tên, SĐT, CCCD; theo dõi lịch sử và xếp hạng thành viên (`REGULAR`, `SILVER`, `GOLD`, `PLATINUM`).
* **🚪 Quản Lý Danh Mục Phòng Nghỉ**:
  - Phân loại theo hạng (`STANDARD`, `VIP`, `LUXURY`) với tiện ích và đơn giá chuyên biệt.
  - Quản lý trạng thái phòng (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`) và bật/tắt chế độ bảo trì phòng linh hoạt.
* **🗺️ Sơ Đồ Mặt Bằng 2D (Interactive Floor Plan)**: Trực quan hóa sơ đồ tầng lầu, trạng thái phòng theo thời gian thực và mô phỏng nội thất 2D sinh động.
* **📅 Lịch Phòng & Tìm Kiếm Phòng Trống (Room Calendar)**:
  - Xem lịch trực quan tình trạng đặt phòng theo từng ngày.
  - Tìm kiếm phòng trống theo khoảng thời gian thực tế (`checkIn` $\rightarrow$ `checkOut`), tự động ngăn chặn trùng lịch (Overlap Date Check).
* **🛎️ Dịch Vụ Phụ Trợ & Tính Giá Đa Hình (Extra Services)**:
  - Quản lý danh mục dịch vụ đi kèm (buffet sáng, spa, đưa đón sân bay, giặt ủi...).
  - Áp dụng đa hình tính giá: Tính theo lượt/món (`PER_ITEM`) hoặc tự động nhân theo số đêm lưu trú (`PER_NIGHT`).
* **💳 Quản Lý Thanh Toán & In Hóa Đơn (Billing & Invoices)**:
  - Ghi nhận đặt cọc (Deposit), thanh toán linh hoạt nhiều đợt, tính số dư còn lại (Balance Due) và hoàn tiền (Refund).
  - Hỗ trợ nhiều phương thức: Tiền mặt, Thẻ ngân hàng, Chuyển khoản.
  - Modal chi tiết đơn đặt phòng kèm tính năng **In Hóa Đơn (Printable Invoice)** chuẩn khổ A4.
* **📊 Quản Lý Doanh Thu & Sổ Quỹ (Revenue & Ledger)**:
  - Thống kê các chỉ số kinh doanh quan trọng: Doanh thu thực nhận, Doanh thu chờ xử lý, Giá phòng bình quân (ADR), Doanh thu phòng khả dụng (RevPAR).
  - Sổ nhật ký giao dịch kèm bộ lọc đa năng, xuất dữ liệu ra file **CSV (Excel)** và in ấn báo cáo tài chính.
* **🌓 Giao Diện Tùy Biến Toàn Diện**: Chuyển đổi mượt mà giữa chế độ Sáng / Tối (Light / Dark Mode), tích hợp thông báo Toast trực quan.

---

## 📂 Cấu Trúc Dự Án

```text
HotelManagement/
├── backend/                                   # Mã nguồn Backend (Spring Boot 4 + Java 21)
│   ├── src/main/java/in/app/hotelmanagement/
│   │   ├── config/                            # Cấu hình & Seed dữ liệu mẫu tự động
│   │   │   ├── ExtraServiceSeeder.java        # Khởi tạo danh mục dịch vụ mẫu
│   │   │   └── PaymentBackfill.java           # Đồng bộ dữ liệu thanh toán ban đầu
│   │   ├── controller/                        # REST Controllers tiếp nhận HTTP requests
│   │   │   ├── BookingController.java         # API đặt phòng, dịch vụ đi kèm & thanh toán
│   │   │   ├── CustomerController.java        # API quản lý hồ sơ khách hàng
│   │   │   ├── ExtraServiceController.java    # API quản lý danh mục dịch vụ phụ trợ
│   │   │   └── RoomController.java            # API quản lý phòng & tra cứu phòng trống
│   │   ├── service/                           # Business Logic & xử lý nghiệp vụ
│   │   │   ├── BookingService.java            # Nghiệp vụ đặt phòng, kiểm tra trùng lịch, phụ phí
│   │   │   ├── CustomerService.java           # Nghiệp vụ khách hàng & lịch sử đặt phòng
│   │   │   ├── ExtraServiceService.java       # Quản lý danh mục dịch vụ phụ trợ
│   │   │   └── RoomService.java               # Danh mục phòng, bảo trì & lọc phòng khả dụng
│   │   ├── repository/                        # Spring Data JPA Repositories
│   │   │   ├── BookingRepository.java         # Truy vấn đơn đặt phòng & chặn trùng lịch JPQL
│   │   │   ├── CustomerRepository.java        # Tra cứu khách hàng theo SĐT, CCCD, Email
│   │   │   ├── ExtraServiceRepository.java    # Truy xuất danh mục dịch vụ
│   │   │   └── RoomRepository.java            # Truy xuất danh mục phòng & trạng thái
│   │   ├── entity/                            # JPA Entities (Thực thể CSDL & Kiến trúc OOP)
│   │   │   ├── Customer.java                  # Thông tin khách hàng
│   │   │   ├── Booking.java                   # Đơn đặt phòng (Quan hệ khách, phòng, dịch vụ, thanh toán)
│   │   │   ├── ExtraService.java              # Danh mục dịch vụ bổ trợ
│   │   │   ├── Payment.java                   # Thực thể giao dịch thanh toán
│   │   │   ├── charge/                        # Đa hình cách tính phí dịch vụ (Polymorphic Charges)
│   │   │   │   ├── ServiceCharge.java         # Lớp cơ sở trừu tượng tính phí
│   │   │   │   ├── PerItemCharge.java         # Tính phí theo số lượng / lượt sử dụng
│   │   │   │   └── PerNightCharge.java        # Tính phí tự động nhân theo số đêm
│   │   │   └── room/                          # Đa hình cấu trúc phòng nghỉ
│   │   │       ├── Room.java                  # Lớp cha trừu tượng (Base Room Entity)
│   │   │       ├── StandardRoom.java          # Phòng Tiêu Chuẩn
│   │   │       ├── VipRoom.java               # Phòng VIP (ban công, bồn tắm, minibar)
│   │   │       └── LuxuryRoom.java            # Phòng Tổng Thống (tiện ích cao cấp)
│   │   ├── dto/                               # Data Transfer Objects
│   │   │   ├── bookingDTO/                    # BookingRequest, BookingResponse, PaymentRequest, ServiceChargeRequest
│   │   │   ├── customerDTO/                   # CustomerRequest, CustomerResponse
│   │   │   ├── roomDTO/                       # RoomRequest, RoomResponse
│   │   │   ├── serviceDTO/                    # ExtraServiceRequest, ExtraServiceResponse
│   │   │   └── CustomerBookingHistoryResponse.java
│   │   ├── enums/                             # Định nghĩa các hằng số trạng thái
│   │   │   ├── BookingStatus.java             # CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
│   │   │   ├── CustomerMembership.java        # REGULAR, SILVER, GOLD, PLATINUM
│   │   │   ├── PaymentMethod.java             # CASH, CREDIT_CARD, BANK_TRANSFER
│   │   │   ├── PaymentType.java               # DEPOSIT, FULL_PAYMENT, PARTIAL_PAYMENT, REFUND
│   │   │   ├── PricingMode.java               # PER_NIGHT, PER_ITEM
│   │   │   ├── RoomStatus.java                # AVAILABLE, OCCUPIED, MAINTENANCE
│   │   │   └── RoomType.java                  # STANDARD, VIP, LUXURY
│   │   ├── exception/                         # Xử lý lỗi ngoại lệ tập trung (Global Exception Handling)
│   │   │   ├── GlobalExceptionHandler.java    # Bắt lỗi toàn cục & chuẩn hóa định dạng JSON
│   │   │   ├── ResourceNotFoundException.java
│   │   │   ├── DuplicateResourceException.java
│   │   │   └── InvalidBookingException.java
│   │   └── HotelManagementApplication.java    # Điểm khởi động Spring Boot
│   ├── src/main/resources/
│   │   └── application.properties             # Cấu hình Cổng 8080, MySQL, Hibernate DDL
│   ├── mvnw / mvnw.cmd                        # Maven Wrapper
│   └── pom.xml                                # Cấu hình Maven dependencies
│
├── frontend/                                  # Mã nguồn Frontend (React 19 + Vite 8 + Tailwind v4)
│   ├── public/                                # Tài nguyên tĩnh & biểu trưng
│   ├── src/
│   │   ├── components/                        # Các UI Components chức năng
│   │   │   ├── booking-detail/                # Modal chi tiết đơn đặt, thanh toán & in hóa đơn
│   │   │   │   └── BookingDetailModal.jsx
│   │   │   ├── booking-history/               # Modal lịch sử đặt phòng của khách hàng
│   │   │   │   └── CustomerBookingHistoryModal.jsx
│   │   │   ├── room-calendar/                 # Lịch trực quan tình trạng phòng theo thời gian thực
│   │   │   │   └── RoomCalendar.jsx
│   │   │   ├── services/                      # Quản lý danh mục dịch vụ phụ trợ
│   │   │   │   └── ServiceCatalog.jsx
│   │   │   ├── floor-plan/                    # Sơ đồ mặt bằng 2D khách sạn tương tác
│   │   │   │   └── HotelFloorPlan2D.jsx
│   │   │   ├── revenue/                       # Quản lý doanh thu & sổ quỹ tài chính
│   │   │   │   └── RevenueManagement.jsx
│   │   │   ├── form/                          # Các biểu mẫu nhập liệu
│   │   │   │   ├── BookingForm.jsx            # Form tạo đơn đặt phòng mới
│   │   │   │   ├── CustomerForm.jsx           # Form thêm/sửa khách hàng
│   │   │   │   ├── RoomForm.jsx               # Form thêm/sửa phòng nghỉ
│   │   │   │   └── ServiceForm.jsx            # Form thêm/sửa dịch vụ phụ trợ
│   │   │   ├── table/                         # Các bảng dữ liệu hiển thị danh sách
│   │   │   │   ├── BookingTable.jsx           # Bảng quản lý đơn đặt phòng
│   │   │   │   ├── CustomerTable.jsx          # Bảng danh sách khách hàng
│   │   │   │   └── RoomTable.jsx              # Bảng danh mục phòng nghỉ
│   │   │   ├── date-picker/                   # Bộ chọn ngày đặt phòng tùy chỉnh
│   │   │   │   └── CustomDatePicker.jsx
│   │   │   ├── glide-select/                  # Dropdown chọn tùy chọn mượt mà
│   │   │   │   └── GlideSelect.jsx
│   │   │   ├── theme/                         # Bộ chuyển đổi giao diện Sáng / Tối
│   │   │   │   └── ThemeToggle.jsx
│   │   │   ├── ui/                            # Hệ thống UI Toast notification & tiện ích
│   │   │   │   ├── ToastProvider.jsx
│   │   │   │   └── index.jsx
│   │   │   ├── icons/                         # Bộ biểu tượng SVG đồng bộ
│   │   │   │   └── Icons.jsx
│   │   │   └── index.js                       # Barrel export các components
│   │   ├── services/                          # Tầng kết nối RESTful API Backend qua Axios
│   │   │   ├── customerService.js             # API khách hàng
│   │   │   ├── roomService.js                 # API phòng nghỉ
│   │   │   ├── bookingService.js              # API đơn đặt phòng
│   │   │   └── extraService.js                # API dịch vụ phụ trợ
│   │   ├── utils/                             # Tiện ích bổ trợ (Nhãn, phân trang, toast)
│   │   │   ├── labels.js
│   │   │   ├── toast.js
│   │   │   └── usePagination.js
│   │   ├── App.jsx                            # Giao diện chính điều hướng Tabs & Sidebar
│   │   ├── index.css                          # Cấu hình Tailwind CSS v4, Theme biến thể
│   │   └── main.jsx                           # Điểm nhập React DOM
│   ├── index.html                             # File HTML chính nạp phông chữ
│   ├── vite.config.js                         # Cấu hình máy chủ Vite
│   └── package.json                           # Khai báo npm dependencies
│
├── docs/                                      # Tài liệu dự án
│   └── design-system/                         # Quy chuẩn thiết kế giao diện UI/UX
│       └── MASTER.md                          # Hệ thống màu sắc, kiểu chữ và CSS tokens
└── README.md                                  # Tài liệu giới thiệu dự án
```

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh

### 1. Yêu Cầu Môi Trường
* **Java Development Kit (JDK) 21 trở lên**
* **Node.js v18 trở lên**
* **MySQL Server 8.0 trở lên**

### 2. Thiết Lập Cơ Sở Dữ Liệu
1. Mở MySQL Client và khởi tạo cơ sở dữ liệu:
   ```sql
   CREATE DATABASE IF NOT EXISTS hotels CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Cấu hình biến môi trường `DB_PASSWORD` (tùy chọn `DB_USERNAME`, mặc định là `root`):
   ```bash
   # Windows PowerShell:
   $env:DB_PASSWORD="MẬT_KHẨU_MYSQL_CỦA_BẠN"
   # macOS / Linux:
   export DB_PASSWORD="MẬT_KHẨU_MYSQL_CỦA_BẠN"
   ```
   *(Nếu sử dụng IntelliJ IDEA hoặc Eclipse, bạn có thể thiết lập `DB_PASSWORD` trong mục Environment Variables của Run Configuration).*

### 3. Khởi Chạy Backend (Cổng 8080)
```bash
cd backend
# Windows:
.\mvnw.cmd spring-boot:run
# macOS / Linux:
./mvnw spring-boot:run
```

### 4. Khởi Chạy Frontend (Cổng 5173)
```bash
cd frontend
npm install
npm run dev
```
Truy cập ứng dụng tại trình duyệt: **http://localhost:5173**

---

## 📡 Danh Sách RESTful API

Địa chỉ gốc: `http://localhost:8080/hotel`

| Nhóm Chức Năng | Phương Thức | Điểm Cuối (Endpoint) | Mô Tả |
| :--- | :--- | :--- | :--- |
| **Khách Hàng** | `GET`, `POST` | `/hotel/customers` | Lấy danh sách / Thêm mới khách hàng |
| | `GET`, `PUT`, `DELETE` | `/hotel/customers/{id}` | Chi tiết / Cập nhật / Xóa hồ sơ khách hàng |
| **Phòng Nghỉ** | `GET`, `POST` | `/hotel/rooms` | Lấy danh sách / Thêm mới phòng |
| | `GET` | `/hotel/rooms/available?checkIn=...&checkOut=...` | Tra cứu phòng trống theo khoảng thời gian (`dd/MM/yyyy`) |
| | `GET`, `PUT`, `DELETE` | `/hotel/rooms/{id}` | Chi tiết / Cập nhật / Xóa thông tin phòng |
| | `PUT` | `/hotel/rooms/{id}/maintenance?enabled=true` | Bật hoặc tắt trạng thái bảo trì phòng |
| **Dịch Vụ Phụ Trợ** | `GET`, `POST` | `/hotel/services` | Lấy danh sách / Tạo mới dịch vụ phụ trợ |
| | `PUT`, `DELETE` | `/hotel/services/{id}` | Cập nhật / Xóa dịch vụ phụ trợ |
| **Đặt Phòng** | `GET`, `POST` | `/hotel/bookings` | Lấy danh sách / Tạo mới đơn đặt phòng |
| | `GET`, `DELETE` | `/hotel/bookings/{id}` | Xem chi tiết / Hủy đơn đặt phòng |
| | `PUT` | `/hotel/bookings/{id}/status?status=...` | Cập nhật trạng thái (`CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`) |
| | `GET` | `/hotel/bookings/customer/{customerId}` | Tra cứu lịch sử đặt phòng của một khách hàng |
| **Phụ Phí & Dịch Vụ Đơn** | `POST` | `/hotel/bookings/{id}/services` | Thêm dịch vụ vào đơn đặt (`serviceId`, `quantity`) |
| | `DELETE` | `/hotel/bookings/{id}/services/{serviceId}` | Xóa dịch vụ phụ trợ khỏi đơn đặt |
| **Thanh Toán & Hóa Đơn** | `POST` | `/hotel/bookings/{id}/payments` | Ghi nhận thanh toán (`amount`, `method`) |

---

## 🎨 Tài Liệu Thiết Kế
Quy chuẩn thiết kế giao diện (Bảng màu, typography, CSS tokens) được lưu trữ tại [docs/design-system/MASTER.md](docs/design-system/MASTER.md).
