// Nhãn hiển thị và tông màu dùng chung cho mọi màn hình (tone khớp với <Badge tone>)

export const BOOKING_STATUS = {
    PENDING: { label: 'Chờ xác nhận', tone: 'amber' },
    CONFIRMED: { label: 'Đã xác nhận', tone: 'blue' },
    CHECKED_IN: { label: 'Đang lưu trú', tone: 'green' },
    CHECKED_OUT: { label: 'Đã trả phòng', tone: 'gray' },
    CANCELLED: { label: 'Đã hủy', tone: 'red' }
};

export const ROOM_STATUS = {
    AVAILABLE: { label: 'Sẵn sàng', tone: 'green' },
    BOOKED: { label: 'Đã đặt', tone: 'blue' },
    OCCUPIED: { label: 'Có khách', tone: 'amber' },
    UNDER_MAINTENANCE: { label: 'Bảo trì', tone: 'gray' }
};

export const ROOM_TYPE = {
    STANDARD: { label: 'Standard', name: 'Tiêu chuẩn', tone: 'gray' },
    VIP: { label: 'VIP', name: 'Cao cấp', tone: 'purple' },
    LUXURY: { label: 'Luxury', name: 'Sang trọng', tone: 'amber' }
};

// Mức giảm giá và ngưỡng chi tiêu khớp với CustomerMembership / Customer.recalculateMembership ở backend
export const MEMBERSHIP = {
    CUSTOMER: { label: 'Thành viên', tone: 'gray', discount: 0, minSpend: null },
    ECONOMY: { label: 'Economy', tone: 'green', discount: 5, minSpend: '2 triệu' },
    PLUS: { label: 'Plus', tone: 'blue', discount: 10, minSpend: '5 triệu' },
    VIP: { label: 'VIP', tone: 'amber', discount: 15, minSpend: '10 triệu' }
};

export const PAYMENT_TYPE = {
    DEPOSIT: 'Tiền cọc',
    PAYMENT: 'Thanh toán',
    REFUND: 'Hoàn tiền'
};

export const PAYMENT_METHOD = {
    CASH: 'Tiền mặt',
    CARD: 'Thẻ',
    TRANSFER: 'Chuyển khoản'
};

// Cách tính tiền dịch vụ (enum PricingMode ở backend)
export const PRICING_MODE = {
    PER_ITEM: { label: 'Theo số lượng', unit: 'lượt', tone: 'blue' },
    PER_NIGHT: { label: 'Theo người × đêm', unit: 'người / đêm', tone: 'purple' }
};

export const formatMoney = (n) => `${Number(n || 0).toLocaleString('vi-VN')} đ`;

export const floorOf = (roomNumber) => {
    const n = Number(roomNumber);
    return n >= 100 ? Math.floor(n / 100) : 1;
};
