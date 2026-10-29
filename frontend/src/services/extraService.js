import axios from 'axios';

const API_URL = 'http://localhost:8080/hotel/services';

const formatPayload = (data) => ({
    name: (data.name || '').trim(),
    unitPrice: Number(data.unitPrice),
    pricingMode: data.pricingMode
});

// 1. GET: Danh mục dịch vụ phát sinh
export const getExtraServices = () => {
    return axios.get(API_URL);
};

// 2. POST: Thêm dịch vụ
export const createExtraService = (data) => {
    return axios.post(API_URL, formatPayload(data));
};

// 3. PUT: Sửa dịch vụ
export const updateExtraService = (id, data) => {
    return axios.put(`${API_URL}/${id}`, formatPayload(data));
};

// 4. DELETE: Xoá dịch vụ
export const deleteExtraService = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};
