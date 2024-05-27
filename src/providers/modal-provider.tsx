"use client";

import { PricesList, TicketDetails } from "@/lib/types";
import { Agency, Contact, Plan, User } from "@prisma/client";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";

interface ModalProviderProps {
  children: ReactNode;
}

export type ModalData = {
  user?: User;
  agency?: Agency;
  ticket?: TicketDetails[0];
  contact?: Contact;
  plans?: {
    defaultPlanId: Plan;
    list: PricesList['data'] 
  }  
};

export type ModalContextType = {
  data: ModalData;
  isOpen: boolean;
  setOpen: (modal: ReactNode, fetchData?: () => Promise<any>) => void;
  setClose: () => void;
};

export const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: false,
  setOpen: (modal: ReactNode, fetchData?: () => Promise<any>) => {},
  setClose: () => {},
});

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ModalData>({});
  const [showingModal, setShowingModal] = useState<React.ReactNode>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const setOpen = async (modal: ReactNode, fetchData?: () => Promise<any>) => {
    if (modal) {
      if (fetchData) {
        setData({ ...data, ...(await fetchData()) } || {});
      }

      setShowingModal(modal);
      setIsOpen(true);
    }
  };

  const setClose = () => {
    setIsOpen(false);
    setData({});
  };

  return (
    <ModalContext.Provider value={{ data, setOpen, setClose, isOpen }}>
      {children}
      {showingModal}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal() hook must be used within the modal provider");
  }
  return context;
};

export default ModalProvider;
