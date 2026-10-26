import axios from 'axios';

const API_URL = 'http://localhost:8080/hotel/rooms';

// Định dạng dữ liệu phòng gửi lên backend
const formatPayload = (data) => {
    return {
        roomNumber: Number(data.roomNumber),
        roomType: data.roomType,
        basePrice: Number(data.basePrice),
    };
};

// 1. GET: Lấy danh sách tất cả phòng
export const getRooms = () => {
    return axios.get(API_URL);
};

// 1b. GET: Lấy chi tiết phòng theo số phòng
export const getRoomByNumber = (roomNumber) => {
    return axios.get(`${API_URL}/${roomNumber}`);
};

// 2. POST: Thêm phòng mới
export const createRoom = (roomData) => {
    return axios.post(API_URL, formatPayload(roomData));
};

// 3. UPDATE (PUT): Cập nhật phòng theo ID (số phòng)
export const updateRoom = (id, roomData) => {
    return axios.put(`${API_URL}/${id}`, formatPayload(roomData));
};

// 3b. PUT: Bật / tắt bảo trì phòng
export const setRoomMaintenance = (roomNumber, enabled) => {
    return axios.put(`${API_URL}/${roomNumber}/maintenance`, null, {
        params: { enabled }
    });
};

// 4. DELETE: Xóa phòng theo ID (số phòng)
export const deleteRoom = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};
