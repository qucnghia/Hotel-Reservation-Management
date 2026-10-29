import axios from 'axios';

const API_URL = 'http://localhost:8080/hotel/bookings';

// Chuẩn hóa dữ liệu gửi lên backend
const formatPayload = (data) => {
    return {
        customerId: Number(data.customerId),
        roomNumber: Number(data.roomNumber),
        checkInDate: data.checkInDate.trim(),
        checkOutDate: data.checkOutDate.trim(),
    };
};

// 1. GET: Lấy danh sách toàn bộ đơn đặt phòng
export const getBookings = () => {
    return axios.get(API_URL);
};

// 1b. GET: Lấy chi tiết đơn đặt phòng theo ID
export const getBookingById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

// 2. POST: Tạo đơn đặt phòng mới
export const createBooking = (bookingData) => {
    return axios.post(API_URL, formatPayload(bookingData));
};

// 3. PUT: Cập nhật trạng thái đơn đặt phòng
export const updateBookingStatus = (id, status) => {
    return axios.put(`${API_URL}/${id}/status`, null, {
        params: { status }
    });
};

// 4. DELETE: Xóa đơn đặt phòng theo ID
export const deleteBooking = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};

// 5. GET: Lấy lịch sử đặt phòng của một khách hàng
export const getCustomerBookingHistory = (customerId) => {
    return axios.get(`${API_URL}/customer/${customerId}`);
};


// 6. POST: Thêm dịch vụ phát sinh vào đơn
export const addBookingService = (id, type, quantity) => {
    return axios.post(`${API_URL}/${id}/services`, { type, quantity: Number(quantity) });
};

// 7. DELETE: Bớt dịch vụ khỏi đơn
export const removeBookingService = (id, serviceId) => {
    return axios.delete(`${API_URL}/${id}/services/${serviceId}`);
};

// 8. POST: Thu tiền (cọc / thanh toán) cho đơn
export const addBookingPayment = (id, amount, method) => {
    return axios.post(`${API_URL}/${id}/payments`, { amount: Number(amount), method });
};
