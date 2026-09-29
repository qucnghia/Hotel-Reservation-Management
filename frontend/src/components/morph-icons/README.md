# Package Morph-Icons (Tách Biệt Cho Dự Án)

Package này đóng gói toàn bộ logic và component sử dụng thư viện **`morphicons`** kết hợp với icon data từ **`lucide`**, giúp các biểu tượng chuyển đổi trạng thái bằng hoạt ảnh vật lý (spring physics morphing) mượt mà.

---

## 1. Cách Sử Dụng

### Cách 1: Nút Menu Chuyển Đổi (Menu $\leftrightarrow$ X)
```jsx
import { useState } from 'react';
import { MorphMenuButton } from './components/morph-icons';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <MorphMenuButton open={open} setOpen={setOpen} size={22} />
  );
}
```

### Cách 2: Sử Dụng Trực Tiếp `MorphIcon` với Icon Data từ `lucide`
```jsx
import { MorphIcon } from "morphicons/react";
import { Menu, X } from "lucide";

<button onClick={() => setOpen(o => !o)} aria-expanded={open}>
  <MorphIcon icon={open ? X : Menu} />
</button>
```

---

## 2. Cách Gỡ Bỏ (Khi Không Cần Nữa)

Nếu sau này bạn không muốn sử dụng hiệu ứng morphing này nữa:

1. **Xóa import & component** trong các file bạn đã dùng (ví dụ: `App.jsx`).
2. **Xóa thư mục package này**:
   ```bash
   # Xóa thư mục
   rm -rf frontend/src/components/morph-icons/
   ```
3. **Gỡ thư viện khỏi npm**:
   ```bash
   cd frontend
   npm uninstall morphicons lucide
   ```
Dự án sẽ trở lại trạng thái ban đầu mà không để lại bất kỳ rác code hay lỗi xung đột nào.
