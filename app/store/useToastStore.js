"use client";

import { create } from "zustand";

let nextId = 1;

export const useToastStore = create((set, get) => ({
    toasts: [],
    show: (message, type = "info", duration = 4200) => {
        const id = nextId++;
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        if (duration > 0) {
            setTimeout(() => get().dismiss(id), duration);
        }
        return id;
    },
    success: (message, duration) => get().show(message, "success", duration),
    error:   (message, duration) => get().show(message, "error", duration),
    info:    (message, duration) => get().show(message, "info", duration),
    dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    clear:   () => set({ toasts: [] }),
}));

// Convenience functions for use outside React (stores, plain modules).
export const toast = {
    show:    (m, t, d) => useToastStore.getState().show(m, t, d),
    success: (m, d)    => useToastStore.getState().success(m, d),
    error:   (m, d)    => useToastStore.getState().error(m, d),
    info:    (m, d)    => useToastStore.getState().info(m, d),
};
