import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmMatchString?: string;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  confirmMatchString,
  isLoading = false,
}) => {
  const [typedString, setTypedString] = useState('');

  const isMatchValid = confirmMatchString ? typedString.trim() === confirmMatchString.trim() : true;

  const handleConfirm = () => {
    if (!isMatchValid) return;
    onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-red-500/10 text-red-500 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h4 className="text-base font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>

          {confirmMatchString && (
            <div className="pt-2 space-y-1.5">
              <p className="text-xs font-medium text-foreground">
                To confirm, type <span className="font-mono text-red-500 select-all font-bold">{confirmMatchString}</span> below:
              </p>
              <Input
                value={typedString}
                onChange={(e) => setTypedString(e.target.value)}
                placeholder={confirmMatchString}
                className="text-xs"
              />
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-4">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirm}
              disabled={!isMatchValid || isLoading}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
