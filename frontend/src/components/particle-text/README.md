# Hiệu ứng Particle Text (React Bits)

Thư mục này chứa hiệu ứng văn bản hạt phân tử ánh sáng tương tác (**Particle Text**) tải từ **React Bits**:
- **Trang chủ**: https://reactbits.dev/text-animations/particle-text
- **Mã nguồn chính**: `ParticleText.jsx`

## Đặc điểm hiệu ứng:
1. Các hạt sáng ban đầu phân tán ngẫu nhiên trong không gian rồi hội tụ (gather) lại tạo nên tiêu đề khách sạn sắc sảo.
2. Tương tác chuột (`pointerRepel`): Khi rê chuột qua tiêu đề, các hạt phân tử sẽ dạt ra tạo hiệu ứng từ trường sống động, sau đó tự hồi vị trí.
3. Hạt trôi nhẹ (`idleDrift`): Khi không rê chuột, các hạt vẫn dao động nhẹ nhàng như những hạt bụi ánh sáng sang trọng.
4. Tương thích Dark Mode với ánh sáng phát quang `glow` màu xanh `#3b82f6` đồng bộ với màu Electric Logo.

## Cách gỡ bỏ khi không cần dùng nữa:
1. Mở `src/App.jsx`.
2. Tìm khối đánh dấu:
   ```jsx
   {/* === [BẮT ĐẦU: HIỆU ỨNG PARTICLE TEXT (REACT BITS)] === */}
   ...
   {/* === [KẾT THÚC: HIỆU ỨNG PARTICLE TEXT] === */}
   ```
3. Thay thế bằng thẻ tiêu đề thông thường `<h1>Hotel Management</h1>`.
4. Xóa thư mục `src/components/particle-text/`.
