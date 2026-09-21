import { useState, useMemo } from 'react';
import { deleteGuest } from '../services/customerService';
import { PencilIcon, TrashIcon, UsersIcon, SearchIcon, XMarkIcon } from './Icons';

export default function CustomerTable({ guests, onEdit, onCustomerDeleted }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGuests = useMemo(() => {
        if (!searchTerm.trim()) return guests || [];
        const term = searchTerm.toLowerCase();
        return (guests || []).filter(g => {
            const name = (g.fullName || g.FullName || '').toLowerCase();
            const email = (g.email || g.Email || '').toLowerCase();
            const id = String(g.id || '');
            return name.includes(term) || email.includes(term) || id.includes(term);
        });
    }, [guests, searchTerm]);

    const handleDelete = async (id, name) => {
        const confirmMsg = `Bạn có chắc chắn muốn xóa khách hàng "${name || id}" (ID: #${id}) không?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await deleteGuest(id);
            alert(`Đã xóa thành công khách hàng #${id}!`);
            onCustomerDeleted();
        } catch (err) {
            console.error('Lỗi khi xóa khách hàng:', err);
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Không thể xóa khách hàng!';
            alert(`Lỗi khi xóa: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
        }
    };

    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md flex flex-col">
            {/* Search Toolbar */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên, email hoặc ID..."
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9.5 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                            aria-label="Xóa từ khóa tìm kiếm"
                        >
                            <XMarkIcon className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="text-xs text-slate-400 hidden sm:block">
                    Hiển thị <span className="font-semibold text-white">{filteredGuests.length}</span> / {guests?.length || 0} khách hàng
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-200">
                    <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                        <tr>
                            <th scope="col" className="px-5 py-3.5 w-20 text-center">ID</th>
                            <th scope="col" className="px-5 py-3.5">Họ và Tên</th>
                            <th scope="col" className="px-5 py-3.5">Ngày sinh</th>
                            <th scope="col" className="px-5 py-3.5">Email</th>
                            <th scope="col" className="px-5 py-3.5 w-36 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                        {filteredGuests && filteredGuests.length > 0 ? (
                            filteredGuests.map((guest) => {
                                const guestId = guest.id;
                                const guestName = guest.fullName || guest.FullName || '---';
                                const guestDob = guest.dob || guest.DOB || '---';
                                const guestEmail = guest.email || guest.Email || '---';

                                return (
                                    <tr
                                        key={guestId}
                                        className="hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                                                #{guestId}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 font-medium text-white">
                                            {guestName}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-300 font-mono text-xs">
                                            {guestDob}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-300">
                                            {guestEmail}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(guest)}
                                                    title="Sửa thông tin khách hàng (PUT)"
                                                    aria-label={`Sửa thông tin khách hàng #${guestId}`}
                                                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                                                >
                                                    <PencilIcon className="w-3.5 h-3.5" />
                                                    <span>Sửa</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(guestId, guestName)}
                                                    title="Xóa khách hàng (DELETE)"
                                                    aria-label={`Xóa khách hàng #${guestId}`}
                                                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                    <span>Xóa</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-14 text-center text-slate-400">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-1">
                                            <UsersIcon className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-medium text-slate-300">
                                            {searchTerm ? 'Không tìm thấy khách hàng phù hợp.' : 'Chưa có khách hàng nào trong hệ thống.'}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {searchTerm ? 'Hãy thử tìm kiếm với từ khóa khác.' : 'Sử dụng biểu mẫu bên trái để thêm khách hàng đầu tiên.'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}