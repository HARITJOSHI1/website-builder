import { SubAccountMedia } from "@/lib/types";
import React from "react";
import MediaUploadButton from "./MediaUploadButton";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { FolderSearch } from "lucide-react";
import MediaCard from "./MediaCard";

type TProps = {
  data: SubAccountMedia;
  subaccountId: string;
};

const Media = ({ data, subaccountId }: TProps) => {
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex justify-between items-center">
        <span className="text-4xl">Media Bucket</span>
        <MediaUploadButton subaccountId={subaccountId} />
      </div>

      <Command className="bg-transparent">
        <CommandInput placeholder="Search for file name..." />
        <CommandList className="pb-40 max-h-full ">
          <CommandEmpty>No Media Files</CommandEmpty>

          <CommandGroup heading="Media Files">
            <div className="flex flex-wrap gap-4 pt-4 justify-center p-12 md:pt-4 md:justify-start">
              {data?.Media.map((file) => (
                <CommandItem
                  key={file.id}
                  className="p-0 w-full rounded-lg !bg-transparent !font-medium !text-white md:max-w-[400px]"
                >
                  <MediaCard file={file} />
                </CommandItem>
              ))}

              {!data?.Media.length && (
                <div className="flex items-center justify-center w-full flex-col">
                  <FolderSearch
                    size={200}
                    className="dark:text-muted text-slate-300"
                  />
                  <p className="text-muted-foreground ">
                    Empty! No files to show.
                  </p>
                </div>
              )}
            </div>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};

export default Media;
