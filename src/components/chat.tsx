import { faComments } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function Chat() {
  const messages = [
    "Test Message 1",
    "Test Answer 1",
    "Test Message 2",
    "Test Answer 2",
  ];

  return (
    <Sheet>
      <SheetTrigger>
        <FontAwesomeIcon
          icon={faComments}
          size="2x"
          className="m-2 cursor-pointer transition-transform hover:scale-110"
        />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Chat</SheetTitle>
          <SheetDescription>
            This is a global chat for Fortress Builder. Stay connected with your
            friends and other people!
          </SheetDescription>
        </SheetHeader>
        <div className="flex h-full flex-col gap-2">
          <div className="grow">
            {messages.map((message) => {
              return (
                <div key={message}>
                  <span>{message}</span>
                </div>
              );
            })}
          </div>
          <Input />
          <Button>Send</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
