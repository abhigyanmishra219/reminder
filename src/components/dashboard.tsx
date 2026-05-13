'use client';

import { useState, useEffect } from "react";
import { Button, Card, Heading, Text, Flex, Container, Spinner } from "@radix-ui/themes";
import Header from "./header";
import ConfirmationModal from "@/components/ConfirmationModal";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  const [excelContacts, setExcelContacts] = useState<any[]>([]);
  const [googleContacts, setGoogleContacts] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [messageTemplate, setMessageTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // New: Template Selection
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Safe token access
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    setToken(savedToken);
  }, []);

  const fetchData = async (uploadId: string | null = null) => {
    if (!token) return;
    try {
      setLoading(true);
      const url = uploadId 
        ? `/api/contacts?uploadId=${uploadId}` 
        : '/api/contacts';

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      setExcelContacts(data.excelContacts || []);
      setGoogleContacts(data.googleContacts || []);
      setSelectedContacts([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleUploadSelect = (uploadId: string | null) => {
    setSelectedUploadId(uploadId);
    fetchData(uploadId);
  };

  // ====================== UPLOAD FUNCTIONS ======================
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch('/api/upload-excel', {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      alert(result.message || "Upload successful!");
      fetchData();
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveGoogleSheet = async () => {
    if (!sheetUrl) return alert("Please paste Google Sheet URL");
    try {
      const res = await fetch('/api/user/sheet', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ sheetUrl }),
      });
      const result = await res.json();
      alert(result.message);
      fetchData();
    } catch (err) {
      alert("Failed to connect Google Sheet");
    }
  };

  const toggleSelect = (contact: any) => {
    if (selectedContacts.some(c => c._id === contact._id)) {
      setSelectedContacts(selectedContacts.filter(c => c._id !== contact._id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleSend = () => {
    if (selectedContacts.length === 0) return alert("Please select at least one person!");
    setShowConfirm(true);
  };

  const confirmSend = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const res = await fetch('/api/send-whatsapp', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          contacts: selectedContacts, 
          message: messageTemplate,
          templateName: selectedTemplate   // ← Passing selected template
        }),
      });
      const result = await res.json();
      alert(`✅ Sent ${result.sent || 0} messages!`);
      fetchData(selectedUploadId);
      setSelectedContacts([]);
    } catch (err) {
      alert("Failed to send messages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="flex h-screen bg-slate-50">
        <Sidebar onSelectUpload={handleUploadSelect} />

        <div className="flex-1 overflow-auto">
          <Container size="4" className="py-8 px-6">

            <div className="mb-8">
              <Heading size="8" className="font-bold text-slate-800">WhatsApp Dashboard</Heading>
              <Text size="3" className="text-slate-500 mt-2">Manage contacts and send WhatsApp reminders easily.</Text>
            </div>

            {/* Upload Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-8 rounded-[28px] border border-slate-200 shadow-sm bg-white">
                <input type="file" accept=".xlsx,.xls" onChange={handleUpload} className="hidden" id="upload" />
                <label htmlFor="upload" className="cursor-pointer block">
                  <div className="border-2 border-dashed border-slate-300 rounded-[24px] p-10 text-center hover:border-green-500 transition-all">
                    <div className="text-6xl mb-4">📊</div>
                    <Heading size="6">Upload Excel Sheet</Heading>
                    <Text size="2" className="text-slate-500 mt-2 block">Upload .xlsx or .xls file</Text>
                    {uploading && <Spinner className="mt-4" />}
                  </div>
                </label>
              </Card>

              
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <Card className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm">
                <Text size="2" className="text-slate-500">Excel Contacts</Text>
                <Heading size="8" className="mt-2 text-green-600">{excelContacts.length}</Heading>
              </Card>
              <Card className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm">
                <Text size="2" className="text-slate-500">Selected</Text>
                <Heading size="8" className="mt-2 text-orange-500">{selectedContacts.length}</Heading>
              </Card>
            </div>

            {/* Excel Table */}
            {excelContacts.length > 0 && (
              <Card className="p-6 rounded-[28px] bg-white border border-slate-200 shadow-sm mb-8">
                <Flex justify="between" align="center" mb="5">
                  <Heading size="6">
                    📊 Excel Contacts {selectedUploadId && "(Filtered)"}
                  </Heading>
                  <div className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    {excelContacts.length} Records
                  </div>
                </Flex>
                <DataTable contacts={excelContacts} selectedContacts={selectedContacts} toggleSelect={toggleSelect} />
              </Card>
            )}

            {/* Template Selector */}
            <Card className="p-6 rounded-[28px] bg-white border border-slate-200 shadow-sm mb-6">
              <Heading size="6" mb="3">📋 Select WhatsApp Template</Heading>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full p-4 rounded-2xl border border-slate-300 outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                <option value="meeting_reminder">Meeting Reminder</option>
                <option value="testing_temp">Testing reminder</option>
                <option value="abc_test">Abc Template</option>
              </select>
            </Card>

            {/* Message Box */}
           

            {/* Send Button */}
            {selectedContacts.length > 0 && (
              <Button size="4" color="green" onClick={handleSend} className="w-full h-14 rounded-[24px] text-lg font-semibold shadow-lg">
                🚀 Send Message ({selectedContacts.length})
              </Button>
            )}

          </Container>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmSend}
        count={selectedContacts.length}
        messageTemplate={messageTemplate}
        templateName={selectedTemplate}
      />
    </>
  );
}

// DataTable Component (unchanged)
function DataTable({ contacts, selectedContacts, toggleSelect }: any) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-4 w-12"><input type="checkbox" /></th>
            <th className="p-4 text-left font-semibold text-slate-700">Name</th>
            <th className="p-4 text-left font-semibold text-slate-700">Phone</th>
            <th className="p-4 text-left font-semibold text-slate-700">Date</th>
            <th className="p-4 text-left font-semibold text-slate-700">Time</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact: any, index: number) => (
            <tr key={contact._id || index} className={`border-t border-slate-200 hover:bg-slate-50 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedContacts.some((c: any) => c._id === contact._id)}
                  onChange={() => toggleSelect(contact)}
                  className="w-4 h-4"
                />
              </td>
              <td className="p-4 font-medium text-slate-700">{contact.name}</td>
              <td className="p-4 text-slate-600">{contact.phone}</td>
              <td className="p-4 text-slate-600">{contact.date}</td>
              <td className="p-4 text-slate-600">{contact.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}