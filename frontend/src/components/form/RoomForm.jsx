import { useState, useEffect } from 'react';
import { createRoom, updateRoom } from '../../services/roomService.js';
import { PlusIcon, PencilIcon, ExclamationTriangleIcon, XMarkIcon, TrashIcon, BedIcon } from '../icons';
import GlideSelect from '../glide-select';

const ROOM_TYPES = [
    { value: 'STANDARD', label: 'STANDARD (Tiêu chuẩn)', tag: 'Tiêu chuẩn' },
    { value: 'VIP', label: 'VIP (Cao cấp)', tag: 'Cao cấp' },
    { value: 'LUXURY', label: 'LUXURY (Sang trọng)', tag: 'Sang trọng' }
];

export default function RoomForm({ editingRoom, existingRooms = [], onSaved, onCancelEdit, onClose, onDelete }) {
    const [formData, setFormData] = useState({
        roomNumber: editingRoom?.roomNumber ?? '',
        roomType: editingRoom?.roomType || 'STANDARD',
        basePrice: editingRoom?.basePrice ?? ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Bắt sự kiện phím Escape để đóng modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

        // 1. Kiểm tra trùng số phòng ngay tại Client khi thêm mới
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
            roomStatus: editingRoom ? editingRoom.roomStatus : 'AVAILABLE'
        };

        setLoading(true);
        try {
            if (editingRoom) {
                // UPDATE (PUT)
                await updateRoom(editingRoom.roomNumber, payload);
                alert(`Cập nhật thông tin phòng #${editingRoom.roomNumber} thành công!`);
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[90vh]">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                editingRoom
                                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                            }`}>
                                {editingRoom ? <PencilIcon className="w-6 h-6" /> : <PlusIcon className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl leading-tight">
                                    {editingRoom ? `Chỉnh Sửa Phòng #${editingRoom.roomNumber}` : 'Tạo Phòng Ở Mới'}
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    {editingRoom
                                        ? `Hạng hiện tại: ${editingRoom.roomType} • Trạng thái: ${editingRoom.roomStatus}`
                                        : 'Khai báo thông số phòng lưu trú mới'}
                                </p>
                            </div>
                        </div>
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                title="Đóng cửa sổ (hoặc ấn ra ngoài)"
                                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto space-y-5 flex-1">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm p-4 rounded-xl flex items-start gap-2.5 leading-relaxed shadow-sm">
                                <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        {/* Số phòng */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="room-number" className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                                <span>Số phòng (Room Number)</span>
                                <span className="text-rose-400 font-bold">*</span>
                            </label>
                            <input
                                id="room-number"
                                type="number"
                                name="roomNumber"
                                value={formData.roomNumber}
                                onChange={handleChange}
                                placeholder="VD: 101, 202..."
                                required
                                disabled={!!editingRoom}
                                className={`w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium ${
                                    editingRoom ? 'opacity-60 cursor-not-allowed bg-slate-900' : ''
                                }`}
                            />
                            {editingRoom && (
                                <span className="text-xs text-slate-400">Số phòng là định danh cố định không thể đổi</span>
                            )}
                        </div>

                        {/* Hạng phòng */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                                <span>Hạng phòng (Room Type)</span>
                                <span className="text-rose-400 font-bold">*</span>
                            </label>
                            <GlideSelect
                                options={ROOM_TYPES}
                                value={formData.roomType}
                                onChange={(val) => setFormData(prev => ({ ...prev, roomType: val }))}
                                size="lg"
                                fullWidth
                                surfaceColor="#020617"
                                highlightColor="#1e293b"
                                accentColor="#818cf8"
                                textColor="#f8fafc"
                                radius={12}
                            />
                        </div>

                        {/* Giá cơ bản */}
                        <div className="flex flex-col gap-2">
                            <label htmlFor="base-price" className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                                <span>Giá cơ bản / đêm (VNĐ)</span>
                                <span className="text-rose-400 font-bold">*</span>
                            </label>
                            <input
                                id="base-price"
                                type="number"
                                name="basePrice"
                                value={formData.basePrice}
                                onChange={handleChange}
                                placeholder="VD: 500000"
                                min="0"
                                required
                                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 flex-wrap">
                        {editingRoom && onDelete ? (
                            <button
                                type="button"
                                onClick={() => onDelete(editingRoom.roomNumber)}
                                disabled={loading}
                                className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                            >
                                <TrashIcon className="w-4 h-4 text-rose-400" />
                                <span>Xóa Phòng Này</span>
                            </button>
                        ) : <div />}

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold transition-all cursor-pointer"
                            >
                                Đóng
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2"
                            >
                                {loading ? (
                                    <span>Đang lưu...</span>
                                ) : (
                                    <span>{editingRoom ? 'Lưu Thay Đổi' : 'Thêm Phòng'}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
