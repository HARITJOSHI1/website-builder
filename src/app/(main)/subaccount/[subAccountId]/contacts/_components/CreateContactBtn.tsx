'use client';

import ContactUserForm from "@/components/forms/ContactUserForm";
import CustomModal from "@/components/global/CustomModal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/providers/modal-provider";
import React from "react";

type TProps = {
  subAccountId: string;
};

const CreateContactBtn = ({ subAccountId }: TProps) => {
  const { setOpen } = useModal();

  const handleCreateContact = () => {
    setOpen(
      <CustomModal
        title="Create contact"
        subheading="Creates a contact which corelates to a customer"
      >
        <ContactUserForm subAccountId={subAccountId} />
      </CustomModal>
    );
  };

  return <Button onClick={handleCreateContact}>Create contact</Button>;
};

export default CreateContactBtn;
