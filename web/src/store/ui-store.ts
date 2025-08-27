import { create } from "zustand";

type Store = {
  openCreatePaymentLinkModal: boolean;
  toggleCreatePaymentLinkModal: () => void;
};

const useUiStore = create<Store>()((set) => ({
  openCreatePaymentLinkModal: false,
  toggleCreatePaymentLinkModal: () =>
    set((state) => ({
      openCreatePaymentLinkModal: !state.openCreatePaymentLinkModal,
    })),
}));

export default useUiStore;
