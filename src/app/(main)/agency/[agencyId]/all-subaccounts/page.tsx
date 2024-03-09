import { AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getAuthUserDetails } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import DeleteButton from "./_components/DeleteButton";
import CreateSubaccountButton from "./_components/CreateSubAccount";

type Props = {
  params: { agencyId: string };
};

const page = async ({ params }: Props) => {
  const authUser = await currentUser();
  const user = await getAuthUserDetails(authUser);

  if (!user) return;

  return (
    <AlertDialog>
      <div className="flex flex-col gap-4 md:flex">
        <CreateSubaccountButton
          user={user}
          id={params.agencyId}
          className="w-[200px] self-end m-6"
        />
        <Command className="rounded-lg bg-transparent">
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found</CommandEmpty>
            <CommandGroup heading="Sub Accounts">
              {user?.Agency?.SubAccount.length ? (
                user.Agency.SubAccount.map((acc) => (
                  <CommandItem
                    key={acc.id}
                    className="h-32 !bg-background my-2 text-primary border-[1px] border-border p-4 rounded-lg hover:!bg-background cursor-pointer transition-all"
                  >
                    <Link
                      href={`/subaccount/${acc.id}`}
                      className="w-full h-full flex gap-4"
                    >
                      <div className="relative w-32">
                        <Image
                          src={acc.subAccountLogo}
                          alt="subaccount logo"
                          fill
                          className="rounded-md object-contain bg-muted/50"
                        />
                      </div>

                      <div className="flex flex-col justify-between">
                        <div className="flex flex-col">
                          {acc.name}
                          <span className="text-muted-foreground text-xs">
                            {acc.address}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-white w-20 hover:bg-red-600 hover:text-white"
                      >
                        Delete
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-left">
                          Are you absolutely sure?
                        </AlertDialogTitle>

                        <AlertDescription>
                          This can't be undone. This will delete the sub account
                          and all data realted to it.
                        </AlertDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter className="flex items-center">
                        <AlertDialogCancel>
                          <div>Cancel</div>
                        </AlertDialogCancel>

                        <AlertDialogAction className="bg-destructive hover:bg-red-600 hover:text-white">
                          <DeleteButton subAccountId={acc.id} />
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </CommandItem>
                ))
              ) : (
                <div className="text-muted-foreground text-center p-4">
                  No subaccounts
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </AlertDialog>
  );
};

export default page;
