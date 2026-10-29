import { useState } from 'react';
import { createRoom, updateRoom, setRoomMaintenance } from '../../services/roomService.js';
import { PlusIcon, PencilIcon, TrashIcon, ShieldAlertIcon } from '../icons/Icons.jsx';
import { Alert, Badge, Button, Field, Input, Modal } from '../ui';
import { ROOM_STATUS, ROOM_TYPE } from '../../utils/labels.js';

export default function RoomForm({ editingRoom, existingRooms = [], onSaved, onClose, onDelete }) {
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
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const roomNum = Number(formData.roomNumber);
        if (!roomNum) {
            setError('Vui lòng nhập số phòng.');
            return;
        }
        // Kiểm tra trùng số phòng ngay trên giao diện khi thêm mới
        if (!editingRoom && existingRooms.some(r => Number(r.roomNumber) === roomNum)) {
            setError(`Phòng ${roomNum} đã tồn tại. Vui lòng chọn số phòng khác.`);
            return;
        }
        if (!formData.basePrice || Number(formData.basePrice) <= 0) {
            setError('Giá phòng phải lớn hơn 0.');
            return;
        }

        const payload = { roomNumber: roomNum, roomType: formData.roomType, basePrice: Number(formData.basePrice) };

        setLoading(true);
        try {
            if (editingRoom) {
                await updateRoom(editingRoom.roomNumber, payload);
            } else {
                await createRoom(payload);
            }
            onSaved();
        } catch (err) {
            console.error('Lỗi khi lưu phòng:', err);
            setError(err.response?.data?.message || err.message || 'Không thể kết nối tới máy chủ.');
        } finally {
            setLoading(false);
        }
    };

    const isUnderMaintenance = editingRoom?.roomStatus === 'UNDER_MAINTENANCE';

    const handleToggleMaintenance = async () => {
        const enable = !isUnderMaintenance;
        const question = enable
            ? `Chuyển phòng ${editingRoom.roomNumber} sang bảo trì? Phòng sẽ không nhận đặt cho đến khi kết thúc bảo trì.`
            : `Kết thúc bảo trì phòng ${editingRoom.roomNumber} và mở lại cho đặt phòng?`;
        if (!window.confirm(question)) return;

        setError(null);
        setLoading(true);
        try {
            await setRoomMaintenance(editingRoom.roomNumber, enable);
            onSaved();
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể cập nhật trạng thái bảo trì.');
        } finally {
            setLoading(false);
        }
    };

    const status = editingRoom && ROOM_STATUS[editingRoom.roomStatus];

    return (
        <Modal
            title={editingRoom ? `Sửa phòng ${editingRoom.roomNumber}` : 'Thêm phòng'}
            description={editingRoom ? <span className="inline-flex items-center gap-2">Trạng thái hiện tại <Badge tone={status?.tone} dot>{status?.label}</Badge></span> : 'Khai báo phòng lưu trú mới.'}
            icon={editingRoom ? PencilIcon : PlusIcon}
            onClose={onClose}
            footer={
                <>
                    {editingRoom && (
                        <div className="mr-auto flex flex-wrap gap-2">
                            {onDelete && (
                                <Button variant="danger" icon={TrashIcon} disabled={loading} onClick={() => onDelete(editingRoom.roomNumber)}>
                                    Xoá
                                </Button>
                            )}
                            <Button icon={ShieldAlertIcon} disabled={loading} onClick={handleToggleMaintenance}>
                                {isUnderMaintenance ? 'Kết thúc bảo trì' : 'Bảo trì phòng'}
                            </Button>
                        </div>
                    )}
                    <Button onClick={onClose} disabled={loading}>Huỷ</Button>
                    <Button type="submit" form="room-form" variant="primary" disabled={loading}>
                        {loading ? 'Đang lưu...' : editingRoom ? 'Lưu thay đổi' : 'Thêm phòng'}
                    </Button>
                </>
            }
        >
            <form id="room-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && <Alert>{error}</Alert>}

                <Field
                    label="Số phòng"
                    htmlFor="room-number"
                    required
                    hint={editingRoom ? 'Số phòng là mã định danh, không đổi được.' : 'Chữ số đầu là tầng, ví dụ 203 là tầng 2.'}
                >
                    <Input
                        id="room-number"
                        type="number"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleChange}
                        placeholder="101"
                        required
                        disabled={!!editingRoom}
                        autoFocus={!editingRoom}
                    />
                </Field>

                <Field label="Hạng phòng" required>
                    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Hạng phòng">
                        {Object.entries(ROOM_TYPE).map(([value, t]) => {
                            const active = formData.roomType === value;
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    onClick={() => setFormData(prev => ({ ...prev, roomType: value }))}
                                    className={`rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer ${
                                        active ? 'border-accent bg-accent-soft ring-1 ring-accent' : 'border-line-strong hover:bg-hover'
                                    }`}
                                >
                                    <p className="text-sm font-medium text-fg">{t.label}</p>
                                    <p className="text-xs text-muted">{t.name}</p>
                                </button>
                            );
                        })}
                    </div>
                </Field>

                <Field label="Giá mỗi đêm (VNĐ)" htmlFor="base-price" required>
                    <Input
                        id="base-price"
                        type="number"
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={handleChange}
                        placeholder="1000000"
                        min="1"
                        required
                    />
                </Field>
            </form>
        </Modal>
    );
}
