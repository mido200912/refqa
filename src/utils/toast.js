import { useState, useCallback } from 'react';

let toastId = 0;

const toasts = [];
const listeners = new Set();

const notify = (listeners) => listeners.forEach(fn => fn([...toasts]));

export const toast = {
    success: (msg) => add(msg, 'success'),
    error: (msg) => add(msg, 'error'),
    info: (msg) => add(msg, 'info'),
};

function add(msg, type) {
    const id = ++toastId;
    toasts.push({ id, msg, type });
    notify(listeners);
    setTimeout(() => {
        const idx = toasts.findIndex(t => t.id === id);
        if (idx !== -1) { toasts.splice(idx, 1); notify(listeners); }
    }, 3500);
}

export const useToast = () => {
    const [list, setList] = useState([...toasts]);
    const subscribe = useCallback((fn) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
    }, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useState(() => { const unsub = subscribe(setList); return unsub; });
    return list;
};
