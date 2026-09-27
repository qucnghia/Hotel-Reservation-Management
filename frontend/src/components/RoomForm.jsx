import { useState } from 'react';
import { createRoom, updateRoom } from '../services/roomService';
import { PlusIcon, PencilIcon, ExclamationTriangleIcon, XMarkIcon } from './Icons';

const ROOM_TYPES = [
    { value: 'STANDARD', label: 'STANDARD (Tiêu chuẩn)' },
    { value: 'VIP', label: 'VIP (Cao cấp)' },
    { value: 'LUXURY', label: 'LUXURY (Sang trọng)' }
];

export default function RoomForm({ editingRoom, existingRooms = [], onSaved, onCancelEdit }) {
    const [formData, setFormData] = useState({
        roomNumber: editingRoom?.roomNumber ?? '',
        roomType: editingRoom?.roomType || 'STANDARD',
        basePrice: editingRoom?.basePrice ?? ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Tự động xóa thông báo lỗi khi người dùng thay đổi dữ liệu
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.roomNumber) {
            setError('Vui lòng nhập số phòng!');
            return;
        }

        const roomNum = Number(formData.roomNumber);

        // 1. Kiểm tra trùng số phòng ngay lập tức ở phía Client khi thêm mới
        if (!editingRoom && existingRooms.some(r => Number(r.roomNumber) === roomNum)) {
            setError(`Số phòng #${roomNum} đã tồn tại trong hệ thống. Vui lòng chọn lại số phòng khác!`);
            return;
        }

        if (!formData.basePrice || Number(formData.basePrice) < 0) {
            setError('Giá phòng phải là một số hợp lệ lớn hơn hoặc bằng 0!');
            return;
        }

        const payload = {
            roomNumber: roomNum,
            roomType: formData.roomType,
            basePrice: Number(formData.basePrice),
            // Trạng thái phòng mặc định là AVAILABLE khi thêm mới, hoặc giữ nguyên trạng thái cũ khi chỉnh sửa
            roomStatus: editingRoom ? editingRoom.roomStatus : 'AVAILABLE'
        };

        setLoading(true);
        try {
            if (editingRoom) {
                // UPDATE (PUT)
                await updateRoom(editingRoom.roomNumber, payload);
                alert(`Cập nhật phòng #${editingRoom.roomNumber} thành công!`);
            } else {
                // CREATE (POST)
                await createRoom(payload);
                alert(`Thêm phòng #${formData.roomNumber} thành công!`);
            }
            setFormData({
                roomNumber: '',
                roomType: 'STANDARD',
                basePrice: ''
            });
            onSaved();
        } catch (err) {
            console.error('Lỗi khi lưu phòng:', err);
            if (err.response) {
                const status = err.response.status;
                // Backend trả về mã 409 hoặc 500 do trùng số phòng
                if (!editingRoom && (status === 500 || status === 409 || status === 400)) {
                    setError(`Số phòng #${formData.roomNumber} đã tồn tại trong hệ thống. Vui lòng chọn lại số phòng khác!`);
                } else if (err.response.data?.message) {
                    setError(err.response.data.message);
                } else {
                    setError(`Không thể lưu phòng (Mã lỗi: ${status}). Vui lòng kiểm tra lại thông tin!`);
                }
            } else {
                setError(err.message || 'Không thể kết nối đến máy chủ Backend!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-5 hover:border-slate-700/80 transition-all duration-300"
        >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        editingRoom
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}>
                        {editingRoom ? <PencilIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base leading-tight">
                            {editingRoom ? `Cập nhật Phòng #${editingRoom.roomNumber}` : 'Thêm Phòng Mới'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {editingRoom ? 'Điều chỉnh thông tin hạng phòng và giá cơ bản' : 'Khai báo thông số phòng lưu trú mới'}
                        </p>
                    </div>
                </div>
                {editingRoom && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                        Đang sửa
                    </span>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl flex items-start gap-2.5 leading-relaxed shadow-sm">
                    <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Field: Room Number */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="room-number" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <span>Số phòng (Room Number)</span>
                    <span className="text-rose-400 font-bold">*</span>
                </label>
                <input
                    id="room-number"
                    type="number"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    placeholder="VD: 101"
                    required
                    disabled={!!editingRoom}
                    aria-required="true"
                    aria-describedby={editingRoom ? "room-number-hint" : undefined}
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono"
                />
                {editingRoom && (
                    <span id="room-number-hint" className="text-[11px] text-slate-500">Mã định danh số phòng không thể thay đổi khi cập nhật.</span>
                )}
            </div>

            {/* Field: Room Type */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="room-type" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <span>Hạng phòng (Room Type)</span>
                    <span className="text-rose-400 font-bold">*</span>
                </label>
                <select
                    id="room-type"
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
                >
                    {ROOM_TYPES.map(type => (
                        <option key={type.value} value={type.value} className="bg-slate-900 text-slate-200">
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Field: Base Price */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor="room-price" className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <span>Giá cơ bản (VNĐ / Đêm)</span>
                    <span className="text-rose-400 font-bold">*</span>
                </label>
                <input
                    id="room-price"
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    placeholder="VD: 500000"
                    min="0"
                    required
                    aria-required="true"
                    className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 mt-2 pt-2 border-t border-slate-800/80">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Đang xử lý...</span>
                        </>
                    ) : (
                        <>
                            {editingRoom ? <PencilIcon className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
                            <span>{editingRoom ? 'Lưu Cập Nhật (PUT)' : 'Thêm Phòng Mới (POST)'}</span>
                        </>
                    )}
                </button>

                {editingRoom && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        disabled={loading}
                        className="w-full bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-medium py-2 px-4 rounded-xl active:scale-[0.98] transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
                    >
                        <XMarkIcon className="w-4 h-4" />
                        <span>Hủy Chỉnh Sửa</span>
                    </button>
                )}
            </div>
        </form>
    );
}
