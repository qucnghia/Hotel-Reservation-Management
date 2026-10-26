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
├── backend/                  # Mã nguồn Backend Spring Boot (Java 21)
│   ├── src/main/java/        # Controller, Service, Repository, Entity, DTO
│   ├── src/main/resources/   # application.properties (Cấu hình DB)
│   └── pom.xml               # Quản lý dependencies Maven
├── frontend/                 # Mã nguồn Frontend React 19 (Vite + Tailwind v4)
│   ├── public/               # Logo và tài nguyên tĩnh
│   ├── src/components/       # Components (Booking, Room, Customer, FloorPlan, Revenue)
│   └── package.json          # Thư viện npm
├── docs/                     # Tài liệu dự án
│   └── design-system/        # Quy chuẩn thiết kế (Bảng màu, typography, CSS tokens)
└── README.md
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
2. Cập nhật mật khẩu MySQL tại `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.password=MẬT_KHẨU_MYSQL_CỦA_BẠN
   ```

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
