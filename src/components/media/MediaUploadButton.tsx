"use client";

import React from "react";
import { Button } from "../ui/button";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "../global/CustomModal";
import UploadMediaForm from "../forms/UploadMediaForm";

type TProps = {
  subAccountId: string;
};

const MediaUploadButton = ({ subAccountId }: TProps) => {
  const { setOpen, setClose, isOpen } = useModal();

  return (
    <Button
      onClick={() => {
        setOpen(
          <CustomModal
            title="Upload form"
            subheading="Upload your file to your media bucket"
          >
            <UploadMediaForm
              subAccountId={subAccountId}
              closeModal={setClose}
            />
          </CustomModal>
        );
      }}
    >
      Upload
    </Button>
  );
};

export default MediaUploadButton;
