"use client";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  messageTemplate?: string;
  templateName?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  count,
  messageTemplate = "",
  templateName = "meeting_reminder",   // Default fallback
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  // Use selected template if available, otherwise fallback
  const activeTemplate = templateName && templateName.trim() !== "" 
    ? templateName 
    : "meeting_reminder";

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

          {/* Template Info */}
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
            <p className="text-sm text-blue-600 mb-1">Using Template:</p>
            <p className="font-semibold text-blue-800 text-lg">{activeTemplate}</p>
          </div>

          {/* Message Preview */}
          {messageTemplate && (
            <div className="bg-gray-50 p-5 rounded-2xl">
              <p className="text-sm text-gray-500 mb-2">Message Preview:</p>
              <p className="text-sm leading-relaxed text-gray-700 italic">
                "{messageTemplate.length > 120 
                  ? messageTemplate.substring(0, 120) + "..." 
                  : messageTemplate}"
              </p>
            </div>
          )}
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