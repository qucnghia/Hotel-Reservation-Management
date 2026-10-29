import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

// toast.success('...') / toast.error('...') từ bất kỳ component nào nằm trong <ToastProvider>
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast phải được dùng bên trong <ToastProvider>');
    return ctx;
}
