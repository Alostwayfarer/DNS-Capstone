import create from "zustand";

export const useDeploymentStore = create((set) => ({
    userId: null,
    setUserId: (userId) => set({ userId }),
}));
