# Hướng dẫn Quản lý & Xóa Hiệu ứng Electric Logo

Thư mục này chứa toàn bộ mã nguồn của hiệu ứng **Electric Logo** từ [React Bits](https://reactbits.dev/animations/electric-logo?glowColor=1e96db&strands=3&flicker=0.45&bend=0).

## 1. Cấu trúc thư mục:
- `ElectricLogo.jsx`: Bộ điều khiển WebGL Shader (OGL) tạo luồng tia sét điện quang.
- `HotelElectricLogo.jsx`: Component bọc Logo khách sạn với tham số:
  - `glowColor`: `#1e96db` (Xanh cyan điện tử)
  - `strands`: `3`
  - `flicker`: `0.45`
  - `bend`: `0`

## 2. Nơi sử dụng trong dự án:
- Được import tại file: `src/App.jsx`
- Tìm đoạn chú thích: `{/* === [ELECTRIC LOGO EFFECT] === */}`

## 3. Cách XÓA HOÀN TOÀN khi không muốn dùng nữa (2 bước):
1. **Trong `src/App.jsx`**: Thay thế dòng `<HotelElectricLogo />` bằng thẻ `<img>` logo thông thường (hoặc mở lại đoạn comment dự phòng trong `App.jsx`).
2. **Xóa thư mục này**: Xóa toàn bộ thư mục `src/components/electric-logo/`.
3. (Tùy chọn) Gỡ thư viện nếu muốn: `npm uninstall ogl`.
