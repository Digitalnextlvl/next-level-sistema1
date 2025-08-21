import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  user_id: string;
  name: string;
  avatar_url?: string;
}

interface MultipleAssigneeSelectorProps {
  users: User[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  placeholder?: string;
}

export function MultipleAssigneeSelector({
  users,
  selectedUserIds,
  onSelectionChange,
  placeholder = "Selecionar responsáveis..."
}: MultipleAssigneeSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedUsers = users.filter(user => selectedUserIds.includes(user.user_id));

  const toggleUser = (userId: string) => {
    const newSelection = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId];
    
    onSelectionChange(newSelection);
  };

  const removeUser = (userId: string) => {
    onSelectionChange(selectedUserIds.filter(id => id !== userId));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedUsers.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <span className="truncate">
                {selectedUsers.length} responsável(is) selecionado(s)
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar usuários..." />
            <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.user_id}
                    value={user.name}
                    onSelect={() => toggleUser(user.user_id)}
                    className="flex items-center gap-2"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        selectedUserIds.includes(user.user_id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{user.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected users display */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedUsers.map((user) => (
            <Badge
              key={user.user_id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <Avatar className="w-4 h-4">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{user.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeUser(user.user_id)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}