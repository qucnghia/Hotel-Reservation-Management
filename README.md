# 🏨 Hệ Thống Quản Lý Khách Sạn (Hotel Management System)

> Ứng dụng Quản lý Khách sạn Fullstack hiện đại, được xây dựng trên nền tảng **Spring Boot 4 (Java 21)** và **React 19 (Vite + Tailwind CSS v4)**, áp dụng chuẩn mực **Lập trình Hướng đối tượng (OOP)** và tích hợp giao diện **Dark Luxury** với hiệu ứng đồ họa WebGL & Canvas tương tác cao cấp.

---

## 📋 Mục Lục
1. [Giới Thiệu Dự Án](#-giới-thiệu-dự-án)
2. [Điểm Nhấn Kiến Trúc & Công Nghệ](#-điểm-nhấn-kiến-trúc--công-nghệ)
3. [Các Tính Năng Chính](#-các-tính-năng-chính)
4. [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
5. [Yêu Cầu Hệ Thống (Prerequisites)](#-yêu-cầu-hệ-thống-prerequisites)
6. [Hướng Dẫn Cài Đặt & Chạy Trên Máy Tính Cá Nhân](#-hướng-dẫn-cài-đặt--chạy-trên-máy-tính-cá-nhân)
7. [Danh Sách RESTful API Endpoints](#-danh-sách-restful-api-endpoints)
8. [Hướng Dẫn Tùy Biến Giao Diện & Hiệu Ứng](#-hướng-dẫn-tùy-biến-giao-diện--hiệu-ứng)
9. [Xử Lý Sự Cố Thường Gặp (Troubleshooting)](#-xử-lý-sự-cố-thường-gặp-troubleshooting)

---

## 🌟 Giới Thiệu Dự Án

**Hotel Management System** là giải pháp phần mềm quản lý vận hành khách sạn toàn diện, đáp ứng nhu cầu theo dõi và xử lý các nghiệp vụ cốt lõi:
- Quản lý hồ sơ khách hàng lưu trú.
- Quản lý danh mục phòng nghỉ theo nhiều phân hạng (Standard, VIP, Luxury).
- Quản lý quy trình đặt phòng (Booking) khép kín từ lúc giữ chỗ, check-in nhận phòng, tính toán chi phí theo số đêm, đến khi check-out hoặc hủy phòng.
- Ngăn chặn hoàn toàn tình trạng trùng lịch phòng thông qua thuật toán kiểm tra xung đột thời gian (Date-Range Overlap Checking).

Dự án được thiết kế theo mô hình **Client - Server (Tách biệt Frontend & Backend)**, đảm bảo tính mở rộng cao, mã nguồn tường minh và dễ bảo trì.

---

## 🛠 Điểm Nhấn Kiến Trúc & Công Nghệ

### 1. Backend (Server Side)
- **Ngôn ngữ**: Java 21 LTS (tận dụng các tính năng mới nhất của Java hiện đại).
- **Framework**: Spring Boot 4.1.x (Spring Web MVC, Spring Data JPA).
- **ORM & Database**: Hibernate / JPA kết hợp cơ sở dữ liệu quan hệ **MySQL 8.0+**.
- **Nguyên lý Thiết kế Hướng đối tượng (OOP)**:
  - **Tính Kế Thừa (Inheritance) & Đa Hình (Polymorphism)**: Lớp cha `Room` định nghĩa các thuộc tính cốt lõi của phòng, các lớp con `StandardRoom`, `VipRoom`, `LuxuryRoom` mở rộng các tiện ích và giá trị riêng biệt.
  - **Tính Đóng Gói (Encapsulation)**: Kiểm soát dữ liệu an toàn qua DTO (`BookingRequest`, `BookingResponse`), che giấu chi tiết xử lý dữ liệu của Entity.
  - **Tính Trừu Tượng (Abstraction)**: Phân tách rõ ràng giữa tầng Service Interface/Implementation và Data Access qua `JpaRepository`.
  - **Quan Hệ Thực Thể Quan Trọng**: Quan hệ `@ManyToOne` giữa `Booking` với `Customer` và `Room`, đảm bảo tính toàn vẹn dữ liệu (Referential Integrity).

### 2. Frontend (Client Side)
- **Nền tảng**: React 19 kết hợp Vite 8 (tốc độ biên dịch siêu tốc, HMR tức thì).
- **Styling**: Tailwind CSS v4 hiện đại, tối ưu giao diện theo phong cách **Liquid Glass Dark Mode**.
- **Hiệu ứng đồ họa tương tác cao cấp (React Bits)**:
  - **Electric Logo (WebGL / OGL)**: Shader phóng điện phát quang sinh động uốn lượn theo từng đường nét kiến trúc toà nhà của logo khách sạn.
  - **Particle Text (Canvas 2D)**: Dòng chữ tiêu đề *HOTEL MANAGEMENT* quy tụ từ hàng nghìn hạt phân tử ánh sáng, phản hồi lực đẩy từ trường khi rê chuột và đồng bộ sóng trôi êm ái.

---

## ✨ Các Tính Năng Chính

### 1. Quản lý Khách Hàng (Customer Management)
- Xem danh sách khách hàng dạng bảng biểu trực quan.
- Thêm mới khách hàng với đầy đủ thông tin: Họ tên, Số điện thoại, Email, Số CCCD/Hộ chiếu.
- Chỉnh sửa và cập nhật hồ sơ khách hàng.
- Xóa khách hàng (có kiểm tra ràng buộc nghiệp vụ).

### 2. Quản lý Phòng Nghỉ (Room Management)
- Quản lý danh sách phòng theo số phòng, phân loại (`STANDARD`, `VIP`, `LUXURY`), giá thuê mỗi đêm.
- Phân biệt tiện ích và trang thiết bị theo từng loại phòng.
- **Quy tắc trạng thái phòng**: Khi thêm phòng mới, trạng thái mặc định luôn là `AVAILABLE` (Sẵn sàng). Trạng thái phòng được tự động chuyển giao bởi quy trình Đặt phòng thay vì sửa thủ công.

### 3. Quản lý Đặt Phòng & Lịch Sử Lưu Trú (Booking Management)
- **Đặt phòng thông minh**: Chọn khách hàng và chọn phòng khả dụng từ danh sách.
- **Tính toán tự động**: Tự động tính số đêm lưu trú và tổng tiền dự kiến theo công thức:
  $$\text{Tổng tiền} = \text{Số đêm} \times \text{Giá phòng/đêm}$$
- **Kiểm tra xung đột phòng (No-Overlap Guarantee)**: Tự động quét cơ sở dữ liệu bằng câu truy vấn JPQL để chặn việc đặt trùng phòng nếu đã có đơn đặt trước trong cùng khoảng ngày check-in/check-out.
- **Vòng đời trạng thái (Booking Status Lifecycle)**:
  - `CONFIRMED`: Đã xác nhận giữ phòng.
  - `CHECKED_IN`: Khách đã nhận phòng $\rightarrow$ Hệ thống tự động chuyển trạng thái phòng sang **`OCCUPIED`**.
  - `CHECKED_OUT`: Khách trả phòng $\rightarrow$ Hệ thống tự động giải phóng phòng về **`AVAILABLE`**.
  - `CANCELLED`: Hủy đặt phòng $\rightarrow$ Hoàn trả phòng về **`AVAILABLE`**.

### 4. Bảng Thống Kê Thời Gian Thực (Dashboard Metrics)
- Dòng chỉ số riêng biệt hiển thị tức thì:
  - Tổng số khách hàng trong hệ thống.
  - Tổng số lượng phòng hiện có.
  - Số phòng đang sẵn sàng đón khách (`AVAILABLE`).
  - Số đơn đặt phòng đang có hiệu lực (`CONFIRMED` / `CHECKED_IN`).

---

## 📂 Cấu Trúc Thư Mục Dự Án

```plaintext
HotelManagement/
├── backend/                               # MÃ NGUỒN BACKEND (SPRING BOOT)
│   ├── .mvn/wrapper/                      # Maven Wrapper cấu hình
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/in/nqn/hotelmanagement/
│   │   │   │   ├── controller/            # REST API Controllers (Booking, Customer, Room)
│   │   │   │   ├── dto/                   # Data Transfer Objects (BookingRequest, BookingResponse)
│   │   │   │   ├── entity/                # JPA Entities (Customer, Room, StandardRoom, VipRoom, LuxuryRoom, Booking)
│   │   │   │   ├── enums/                 # Enum types (RoomType, RoomStatus, BookingStatus)
│   │   │   │   ├── exception/             # Global Exception Handler & Custom Exceptions
│   │   │   │   ├── repository/            # Spring Data JPA Repositories
│   │   │   │   ├── service/               # Business Logic Services
│   │   │   │   └── HotelManagementApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties # Cấu hình Database MySQL, JPA/Hibernate, Port
│   ├── mvnw / mvnw.cmd                    # Maven Wrapper executable
│   └── pom.xml                            # Quản lý thư viện phụ thuộc Maven
│
├── frontend/                              # MÃ NGUỒN FRONTEND (REACT + VITE)
│   ├── public/                            # Tài nguyên tĩnh (Logo khách sạn)
│   │   ├── hotel-building-logo.png
│   │   └── hotel-logo.png
│   ├── src/
│   │   ├── components/                    # Các UI Components nghiệp vụ
│   │   │   ├── CustomerForm.jsx           # Form thêm/sửa khách hàng
│   │   │   ├── CustomerTable.jsx          # Bảng danh sách khách hàng
│   │   │   ├── RoomForm.jsx               # Form thêm/sửa phòng
│   │   │   ├── RoomTable.jsx              # Bảng danh sách phòng
│   │   │   ├── BookingForm.jsx            # Form tạo đơn đặt phòng
│   │   │   ├── BookingTable.jsx           # Bảng danh sách & chuyển trạng thái đặt phòng
│   │   │   ├── Icons.jsx                  # Icon SVG đồng bộ
│   │   │   ├── electric-logo/             # Hiệu ứng Electric Logo (Tách biệt, dễ gỡ bỏ)
│   │   │   │   ├── ElectricLogo.jsx       # Canvas WebGL shader
│   │   │   │   ├── HotelElectricLogo.jsx  # Wrapper component
│   │   │   │   └── README.md
│   │   │   └── particle-text/             # Hiệu ứng Particle Text (Tách biệt, dễ gỡ bỏ)
│   │   │       ├── ParticleText.jsx       # Canvas 2D interactive particles
│   │   │       └── README.md
│   │   ├── services/                      # Axios HTTP client gọi API backend
│   │   │   ├── customerService.js
│   │   │   ├── roomService.js
│   │   │   └── bookingService.js
│   │   ├── App.jsx                        # Giao diện chính điều hướng Tabs & Header
│   │   ├── main.jsx                       # Entry point React DOM
│   │   └── index.css                      # Tailwind v4 & cấu hình phông chữ
│   ├── index.html                         # Template HTML nạp font Google Fonts
│   ├── package.json                       # Thư viện npm
│   └── vite.config.js                     # Cấu hình Vite
│
└── README.md                              # Tài liệu hướng dẫn dự án
```

---

## 💻 Yêu Cầu Hệ Thống (Prerequisites)

Trước khi tiến hành cài đặt, hãy đảm bảo máy tính cá nhân đã được cài đặt các công cụ sau:

| Công cụ | Phiên bản yêu cầu | Mục đích |
| :--- | :--- | :--- |
| **Java Development Kit (JDK)** | **Java 21 trở lên** (JDK 21 hoặc JDK 24) | Biên dịch và chạy Backend Spring Boot 4 |
| **MySQL Server** | **MySQL 8.0+** | Hệ quản trị cơ sở dữ liệu quan hệ |
| **Node.js** | **v18.0.0+** (Khuyến nghị **v20 LTS**) | Môi trường chạy và quản lý gói Frontend |
| **npm** | Đi kèm Node.js (v9.x - v10.x+) | Trình quản lý thư viện JavaScript |
| **Git** | Bản mới nhất | Quản lý mã nguồn (tùy chọn) |
| **Trình duyệt Web** | Chrome, Edge, Firefox, Brave | Hỗ trợ WebGL 2.0 & Canvas 2D |

> [!IMPORTANT]
> **Lưu ý về phiên bản Java**: Dự án sử dụng Spring Boot 4.1.1 với cấu hình `java.version=21`. Bắt buộc phải chạy dự án bằng **JDK 21 trở lên** (không thể chạy trên JDK 8, 11 hoặc 17).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Trên Máy Tính Cá Nhân

Dự án gồm 2 phần độc lập: **Backend** (cổng `8080`) và **Frontend** (cổng `5173`). Bạn hãy thực hiện lần lượt theo các bước dưới đây:

### Bước 1: Thiết lập Cơ sở dữ liệu MySQL

1. Mở phần mềm quản lý MySQL (ví dụ: **MySQL Workbench**, **DBeaver**, **Navicat** hoặc **MySQL Command Line Client**).
2. Đăng nhập tài khoản MySQL của bạn (thường là `root`).
3. Chạy lệnh SQL sau để tạo cơ sở dữ liệu cho dự án:
   ```sql
   CREATE DATABASE IF NOT EXISTS hotels CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Mở file cấu hình kết nối tại: [`backend/src/main/resources/application.properties`](file:///d:/Project/OOP%20project/HotelManagement/backend/src/main/resources/application.properties)
5. Kiểm tra và chỉnh sửa lại `username` và `password` tương ứng với tài khoản MySQL trên máy của bạn:
   ```properties
   spring.application.name=HotelManagement

   spring.datasource.url=jdbc:mysql://localhost:3306/hotels?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=kocomk111    <--- ĐỔI THÀNH MẬT KHẨU MYSQL CỦA BẠN
   
   spring.jpa.show-sql=true
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.properties.hibernate.format_sql=true
   ```
   *(Nhờ thiết lập `hibernate.ddl-auto=update`, Hibernate sẽ tự động tạo toàn bộ bảng dữ liệu khi Backend khởi động lần đầu).*

---

### Bước 2: Khởi động Backend (Spring Boot)

1. Mở cửa sổ **Terminal** hoặc **PowerShell**.
2. Di chuyển vào thư mục `backend`:
   ```bash
   cd backend
   ```
3. *(Dành riêng cho máy tính có nhiều bản Java)*: Đảm bảo biến môi trường `JAVA_HOME` đang trỏ tới JDK 21 trở lên. Ví dụ trên PowerShell:
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"  # Hoặc đường dẫn JDK 21/24 trên máy bạn
   ```
4. Kiểm tra lại phiên bản Java đang hoạt động:
   ```bash
   java -version
   ```
5. Khởi chạy Backend bằng Maven Wrapper:
   - **Trên Windows (CMD / PowerShell)**:
     ```cmd
     .\mvnw.cmd spring-boot:run
     ```
   - **Trên macOS / Linux**:
     ```bash
     chmod +x mvnw
     ./mvnw spring-boot:run
     ```
6. Khi thấy dòng log thông báo tương tự như sau xuất hiện, Backend đã khởi động thành công:
   ```plaintext
   Started HotelManagementApplication in 2.345 seconds (process running for 2.891)
   Tomcat started on port 8080 (http) with context path '/'
   ```
   *(Backend đang lắng nghe tại: `http://localhost:8080`)*.

---

### Bước 3: Khởi động Frontend (React + Vite)

1. Mở một cửa sổ **Terminal / PowerShell mới** (giữ cửa sổ Backend vẫn đang chạy).
2. Di chuyển vào thư mục `frontend`:
   ```bash
   cd frontend
   ```
3. Cài đặt các gói thư viện phụ thuộc (Dependencies):
   ```bash
   npm install
   ```
4. Khởi động môi trường phát triển Vite:
   ```bash
   npm run dev
   ```
5. Terminal sẽ hiển thị liên kết truy cập cục bộ:
   ```plaintext
     VITE v8.3.0  ready in 240 ms

     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
   ```
6. Mở trình duyệt Web của bạn và truy cập địa chỉ:
   👉 **http://localhost:5173**

🎉 **Chúc mừng! Hệ thống Quản Lý Khách Sạn đã sẵn sàng hoạt động trên máy tính của bạn!**

---

## 📡 Danh Sách RESTful API Endpoints

Backend cung cấp đầy đủ các chuẩn API RESTful tại địa chỉ `http://localhost:8080/hotel`:

### 1. Quản lý Khách Hàng (`/hotel/customers`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/hotel/customers` | Lấy danh sách toàn bộ khách hàng |
| `GET` | `/hotel/customers/{id}` | Lấy chi tiết khách hàng theo ID |
| `POST` | `/hotel/customers` | Tạo mới một khách hàng |
| `PUT` | `/hotel/customers/{id}` | Cập nhật thông tin khách hàng |
| `DELETE`| `/hotel/customers/{id}` | Xóa khách hàng khỏi hệ thống |

### 2. Quản lý Phòng (`/hotel/rooms`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/hotel/rooms` | Lấy danh sách toàn bộ phòng |
| `GET` | `/hotel/rooms/{id}` | Lấy chi tiết thông tin một phòng |
| `POST` | `/hotel/rooms` | Tạo mới phòng nghỉ |
| `PUT` | `/hotel/rooms/{id}` | Cập nhật thông tin phòng |
| `DELETE`| `/hotel/rooms/{id}` | Xóa phòng khỏi hệ thống |

### 3. Quản lý Đặt Phòng (`/hotel/bookings`)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/hotel/bookings` | Lấy danh sách lịch sử toàn bộ đơn đặt phòng |
| `GET` | `/hotel/bookings/{id}` | Xem chi tiết đơn đặt phòng |
| `POST` | `/hotel/bookings` | Tạo mới đơn đặt phòng (tự tính giá & check trùng lịch) |
| `PUT` | `/hotel/bookings/{id}` | Cập nhật thông tin đơn đặt phòng |
| `PATCH`| `/hotel/bookings/{id}/status` | Chuyển đổi trạng thái (`CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`) |
| `DELETE`| `/hotel/bookings/{id}` | Hủy đơn đặt phòng và giải phóng trạng thái phòng |

---

## 🎨 Hướng Dẫn Tùy Biến Giao Diện & Hiệu Ứng

Dự án được cấu trúc dạng module độc lập (isolated components) để bạn có thể dễ dàng điều chỉnh hoặc gỡ bỏ các hiệu ứng đồ họa mà không ảnh hưởng đến nghiệp vụ quản lý:

### 1. Đổi màu chữ tiêu đề Particle Text
Mở file [`frontend/src/App.jsx`](file:///d:/Project/OOP%20project/HotelManagement/frontend/src/App.jsx) tại dòng **154**:
```jsx
<ParticleText
    text="HOTEL MANAGEMENT"
    color="#ffffff"          // <-- Màu chính của hạt bên trái (Mặc định: Trắng)
    highlightColor="#3b82f6" // <-- Màu chuyển sắc bên phải & vầng hào quang phát sáng
    ...
/>
```
- **Vàng Gold Hoàng Gia**: Đổi `highlightColor="#f59e0b"`.
- **Xanh Ngọc Lục Bảo**: Đổi `highlightColor="#10b981"`.
- **Tím Neon Cyber**: Đổi `highlightColor="#8b5cf6"`.

### 2. Điều chỉnh thông số hiệu ứng Electric Logo
Mở file [`frontend/src/App.jsx`](file:///d:/Project/OOP%20project/HotelManagement/frontend/src/App.jsx) tại thẻ `<HotelElectricLogo />`:
- `glowColor`: Mã màu tia sét (hiện tại: `#1173fb`).
- `strands`: Số lượng sợi tia điện chạy viền (hiện tại: `6`).
- `flicker`: Độ nhấp nháy phát quang (hiện tại: `0.6`).
- `interactive`: Bật/tắt tương tác khi rê chuột (`true`/`false`).

### 3. Cách gỡ bỏ hoàn toàn hiệu ứng nếu muốn giao diện tối giản
Mỗi hiệu ứng đều được đóng gói trong một thư mục riêng biệt kèm comment đánh dấu rõ ràng trong `App.jsx`:
- **Gỡ Electric Logo**: Xóa thư mục `frontend/src/components/electric-logo/` và xóa thẻ `<HotelElectricLogo />` trong `App.jsx`.
- **Gỡ Particle Text**: Xóa thư mục `frontend/src/components/particle-text/` và thay thẻ `<ParticleText />` bằng thẻ `<h1>Hotel Management</h1>` truyền thống.

---

## 🔧 Xử Lý Sự Cố Thường Gặp (Troubleshooting)

### 1. Lỗi `java.lang.UnsupportedClassVersionError` hoặc `Source option 21 is no longer supported`
- **Nguyên nhân**: Phiên bản Java mặc định trên máy tính của bạn thấp hơn Java 21 (ví dụ đang dùng Java 11 hoặc 17).
- **Khắc phục**:
  1. Tải và cài đặt **Oracle JDK 21+** hoặc **Eclipse Temurin 21+**.
  2. Thiết lập lại biến môi trường trong Terminal trước khi chạy:
     ```powershell
     $env:JAVA_HOME = "C:\Program Files\Java\jdk-21"  # Windows
     export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home # macOS
     ```

### 2. Lỗi `Access denied for user 'root'@'localhost'`
- **Nguyên nhân**: Mật khẩu MySQL trong file `application.properties` không khớp với mật khẩu tài khoản MySQL trên máy của bạn.
- **Khắc phục**: Mở file `backend/src/main/resources/application.properties` và sửa dòng `spring.datasource.password=` thành đúng mật khẩu MySQL của bạn.

### 3. Lỗi `Unknown database 'hotels'`
- **Nguyên nhân**: Bạn chưa tạo cơ sở dữ liệu `hotels` trong MySQL.
- **Khắc phục**: Mở MySQL và chạy câu lệnh `CREATE DATABASE hotels;`.

### 4. Lỗi Port 8080 hoặc 5173 đã bị chiếm dụng (Port already in use)
- **Nếu cổng 8080 bị chiếm**: Mở `application.properties` thêm dòng `server.port=8081` (lưu ý cần cập nhật URL tương ứng trong thư mục `frontend/src/services/`).
- **Nếu cổng 5173 bị chiếm**: Vite sẽ tự động chuyển sang cổng tiếp theo (ví dụ `5174`). Bạn chỉ việc nhấn vào link do Vite hiển thị trên terminal.

---

## 👥 Tác Giả & Giấy Phép (License)
- **Dự án**: Bài tập lớn Lập trình Hướng đối tượng (OOP Project) - Quản Lý Khách Sạn.
- **Bản quyền**: Dự án mã nguồn mở phục vụ mục đích học tập và nghiên cứu.
