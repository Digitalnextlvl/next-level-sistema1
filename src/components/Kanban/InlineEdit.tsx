import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function InlineEdit({ 
  value, 
  onSave, 
  className = "", 
  placeholder = "Digite aqui...",
  disabled = false 
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (disabled) {
    return (
      <span className={`${className} cursor-default`}>
        {value || placeholder}
      </span>
    );
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`${className} h-auto p-0 border-none bg-transparent focus:bg-background rounded`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      className={`${className} cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors`}
      onClick={() => setIsEditing(true)}
      title="Clique para editar"
    >
      {value || placeholder}
    </span>
  );
}