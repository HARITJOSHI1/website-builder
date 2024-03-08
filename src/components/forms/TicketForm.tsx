"use client";

import { getSubAccountTeamMembers, saveActivityLogsNotification, searchContacts, upsertTicket } from "@/lib/queries";
import { TicketWithTags } from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact, Tag, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "../ui/use-toast";

type TProps = {
  laneId: string;
  subaccountId: string;
  getNewTicket: (ticket: TicketWithTags[0]) => void;
};

const currentValRegex = /^\d+(\.\d{1,2})?$/;

const TicketFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  value: z.string().refine((value) => currentValRegex.test(value), {
    message: "Value must be a valid price.",
  }),
});

const TicketForm = ({ getNewTicket, laneId, subaccountId }: TProps) => {
  const { data: defaultData, setClose } = useModal();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [contact, setContact] = useState("");
  const [search, setSearch] = useState("");
  const [contactList, setContactList] = useState<Contact[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const [allTeamMembers, setAllTeamMembers] = useState<User[]>([]);
  const [assignedTo, setAssignedTo] = useState(
    defaultData.ticket?.Assigned?.id || ""
  );

  const form = useForm<z.infer<typeof TicketFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(TicketFormSchema),
    defaultValues: {
      name: defaultData.ticket?.name || "",
      description: defaultData.ticket?.description || "",
      value: String(defaultData.ticket?.value || 0),
    },
  });

  useEffect(() => {
    if (subaccountId) {
      const fetchData = async () => {
        const response = await getSubAccountTeamMembers(subaccountId);
        if (response) setAllTeamMembers(response);
      };
      fetchData();
    }
  }, [subaccountId]);

  useEffect(() => {
    if (defaultData.ticket) {
      form.reset({
        name: defaultData.ticket.name || "",
        description: defaultData.ticket?.description || "",
        value: String(defaultData.ticket?.value || 0),
      });

      if (defaultData.ticket.customerId)
        setContact(defaultData.ticket.customerId);

      const fetchData = async () => {
        const response = await searchContacts(
          //@ts-ignore
          defaultData.ticket?.Customer?.name
        );
        setContactList(response);
      };
      fetchData();
    }
  }, [defaultData]);


  const onSubmit = async (values: z.infer<typeof TicketFormSchema>) => {
    if (!laneId) return
    try {
      const response = await upsertTicket(
        {
          ...values,
          laneId,
          id: defaultData.ticket?.id,
          assignedUserId: assignedTo,
          ...(contact ? { customerId: contact } : {}),
        },
        tags
      )

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a ticket | ${response?.name}`,
        subAccountId: subaccountId,
      })

      toast({
        title: 'Success',
        description: 'Saved  details',
      })
      if (response) getNewTicket(response)
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oppse!',
        description: 'Could not save pipeline details',
      })
    }
    setClose()
  }


  const isLoading = form.formState.isLoading;
  return <div>TicketForm</div>;
};

export default TicketForm;
