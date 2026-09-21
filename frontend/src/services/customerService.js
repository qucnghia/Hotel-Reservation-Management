import axios from 'axios';

const API_URL = 'http://localhost:8080/hotel/guests';

// Chuẩn hóa dữ liệu gửi lên backend theo đúng chuẩn camelCase của Jackson
const formatPayload = (data) => {
    return {
        fullName: (data.fullName || data.FullName || '').trim(),
        dob: (data.dob || data.DOB || '').trim(),
        email: (data.email || data.Email || '').trim(),
    };
};

// 1. GET: Lấy danh sách toàn bộ khách hàng
export const getGuests = () => {
    return axios.get(API_URL);
};

// 1b. GET: Lấy thông tin chi tiết một khách hàng theo ID
export const getGuestById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

// 2. POST: Thêm mới khách hàng
export const createGuest = (guestData) => {
    return axios.post(API_URL, formatPayload(guestData));
};

// 3. UPDATE (PUT): Cập nhật thông tin khách hàng theo ID
export const updateGuest = (id, guestData) => {
    return axios.put(`${API_URL}/${id}`, formatPayload(guestData));
};

// 4. DELETE: Xóa khách hàng theo ID
export const deleteGuest = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};