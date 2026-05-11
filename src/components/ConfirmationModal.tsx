"use client";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  messageTemplate: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  count,
  messageTemplate,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 px-8 py-6 border-b">
          <h2 className="text-2xl font-bold text-red-700">⚠️ Confirm Sending Messages</h2>
          <p className="text-red-600 mt-1">This action cannot be undone</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="bg-gray-50 p-5 rounded-2xl">
            <p className="text-lg font-medium">
              You are about to send <strong className="text-green-600">{count}</strong> WhatsApp reminder messages.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Message Preview:</p>
            <div className="bg-gray-100 p-4 rounded-2xl text-sm italic border">
              {messageTemplate}
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-xl">
            📌 Messages will be sent using Twilio Sandbox. Only numbers joined in sandbox will receive them.
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 px-8 py-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 border border-gray-300 rounded-2xl font-medium hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold transition"
          >
            Yes, Send Messages
          </button>
        </div>
      </div>
    </div>
  );
}