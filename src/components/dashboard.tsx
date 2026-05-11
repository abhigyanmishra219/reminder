"use client";
import { useState, useEffect } from "react";
import { Button, Card, Heading, Text, Flex, Container, Spinner } from "@radix-ui/themes";
import Header from "./header";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function Dashboard() {
  const [excelContacts, setExcelContacts] = useState<any[]>([]);
  const [googleContacts, setGoogleContacts] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [messageTemplate, setMessageTemplate] = useState(
    ""
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/contacts', {
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
    fetchData();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      alert(result.message);
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
        body: JSON.stringify({ contacts: selectedContacts, message: messageTemplate }),
      });
      const result = await res.json();
      alert(`✅ Sent ${result.sent || 0} messages!`);
      fetchData();
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

    <div className="min-h-screen bg-slate-50">
      <Container size="4" className="py-8 px-4">

        {/* TOP */}
        <div className="mb-8">
          <Heading
            size="8"
            className="font-bold text-slate-800"
          >
            WhatsApp Dashboard
          </Heading>

          <Text
            size="3"
            className="text-slate-500 mt-2 block"
          >
            Manage contacts and send WhatsApp reminders easily.
          </Text>
        </div>

        {/* ACTION SECTION */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {/* EXCEL */}
          <Card className="p-8 rounded-[28px] border border-slate-200 shadow-sm bg-white">

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUpload}
              className="hidden"
              id="upload"
            />

            <label
              htmlFor="upload"
              className="cursor-pointer block"
            >

              <div className="border-2 border-dashed border-slate-300 rounded-[24px] p-10 text-center hover:border-green-500 transition-all">

                <div className="text-6xl mb-4">
                  📊
                </div>

                <Heading size="6">
                  Upload Excel Sheet
                </Heading>

                <Text
                  size="2"
                  className="text-slate-500 mt-2 block"
                >
                  Upload .xlsx or .xls file
                </Text>

                {uploading && (
                  <div className="mt-4">
                    <Spinner />
                  </div>
                )}
              </div>
            </label>
          </Card>

          {/* GOOGLE SHEET */}
          <Card className="p-8 rounded-[28px] border border-slate-200 shadow-sm bg-white">

            <div className="text-6xl mb-4 text-center">
              📑
            </div>

            <Heading size="6" mb="4">
              Connect Google Sheet
            </Heading>

            <Flex direction="column" gap="3">

              <input
                type="text"
                value={sheetUrl}
                onChange={(e) =>
                  setSheetUrl(e.target.value)
                }
                placeholder="Paste Google Sheet URL..."
                className="w-full p-4 rounded-2xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <Button
                size="3"
                onClick={saveGoogleSheet}
                className="rounded-2xl h-11"
              >
                Connect Sheet
              </Button>

            </Flex>
          </Card>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <Card className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm">
            <Text size="2" className="text-slate-500">
              Excel Contacts
            </Text>

            <Heading
              size="8"
              className="mt-2 text-green-600"
            >
              {excelContacts.length}
            </Heading>
          </Card>

          <Card className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm">
            <Text size="2" className="text-slate-500">
              Google Contacts
            </Text>

            <Heading
              size="8"
              className="mt-2 text-blue-600"
            >
              {googleContacts.length}
            </Heading>
          </Card>

          <Card className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm">
            <Text size="2" className="text-slate-500">
              Selected Contacts
            </Text>

            <Heading
              size="8"
              className="mt-2 text-orange-500"
            >
              {selectedContacts.length}
            </Heading>
          </Card>
        </div>

        {/* EXCEL TABLE */}
        {excelContacts.length > 0 && (
          <Card className="p-6 rounded-[28px] bg-white border border-slate-200 shadow-sm mb-8">

            <Flex justify="between" align="center" mb="5">

              <Heading size="6">
                📊 Excel Contacts
              </Heading>

              <div className="px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                {excelContacts.length} Records
              </div>

            </Flex>

            <DataTable
              contacts={excelContacts}
              selectedContacts={selectedContacts}
              toggleSelect={toggleSelect}
            />
          </Card>
        )}

        {/* GOOGLE TABLE */}
        {googleContacts.length > 0 && (
          <Card className="p-6 rounded-[28px] bg-white border border-slate-200 shadow-sm mb-8">

            <Flex justify="between" align="center" mb="5">

              <Heading size="6">
                📑 Google Sheet Contacts
              </Heading>

              <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                {googleContacts.length} Records
              </div>

            </Flex>

            <DataTable
              contacts={googleContacts}
              selectedContacts={selectedContacts}
              toggleSelect={toggleSelect}
            />
          </Card>
        )}

        {/* MESSAGE */}
        {(excelContacts.length > 0 ||
          googleContacts.length > 0) && (

          <Card className="p-8 rounded-[28px] bg-white border border-slate-200 shadow-sm mb-8">

            <Heading size="6" mb="4">
              ✍️ Customize WhatsApp Message
            </Heading>

            <textarea
              value={messageTemplate}
              onChange={(e) =>
                setMessageTemplate(e.target.value)
              }
              placeholder="Type your custom message..."
              className="w-full h-44 p-5 rounded-[24px] border border-slate-300 outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />

            <Text
              size="2"
              className="text-slate-500 mt-3 block"
            >
              Message will be sent to selected contacts.
            </Text>
          </Card>
        )}

        {/* SEND BUTTON */}
        {selectedContacts.length > 0 && (

          <Button
            size="4"
            color="green"
            onClick={handleSend}
            className="w-full h-14 rounded-[24px] text-lg font-semibold shadow-lg"
          >
            🚀 Send Message (
            {selectedContacts.length}
            )
          </Button>
        )}

        {/* EMPTY STATE */}
        {excelContacts.length === 0 &&
          googleContacts.length === 0 && (

          <Card className="p-16 rounded-[28px] text-center bg-white border border-slate-200 shadow-sm">

            <div className="text-7xl mb-6">
              📭
            </div>

            <Heading size="6">
              No Contacts Found
            </Heading>

            <Text
              size="3"
              className="text-slate-500 mt-3 block"
            >
              Upload an Excel sheet or connect Google Sheet to start.
            </Text>
          </Card>
        )}

      </Container>
    </div>

    <ConfirmationModal
      isOpen={showConfirm}
      onClose={() => setShowConfirm(false)}
      onConfirm={confirmSend}
      count={selectedContacts.length}
      messageTemplate={messageTemplate}
    />
  </>
);
}

// Reusable Table Component
function DataTable({
  contacts,
  selectedContacts,
  toggleSelect
}: any) {

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">

      <table className="w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="p-4 w-12">
              <input type="checkbox" />
            </th>

            <th className="p-4 text-left font-semibold text-slate-700">
              Name
            </th>

            <th className="p-4 text-left font-semibold text-slate-700">
              Phone
            </th>

            <th className="p-4 text-left font-semibold text-slate-700">
              Date
            </th>

            <th className="p-4 text-left font-semibold text-slate-700">
              Time
            </th>

          </tr>
        </thead>

        <tbody>

          {contacts.map((contact: any, index: number) => (

            <tr
              key={contact._id}
              className={`border-t border-slate-200 hover:bg-slate-50 transition-all ${
                index % 2 === 0
                  ? "bg-white"
                  : "bg-slate-50/50"
              }`}
            >

              <td className="p-4">

                <input
                  type="checkbox"
                  checked={selectedContacts.some(
                    (c: any) =>
                      c._id === contact._id
                  )}
                  onChange={() =>
                    toggleSelect(contact)
                  }
                  className="w-4 h-4"
                />
              </td>

              <td className="p-4 font-medium text-slate-700">
                {contact.name}
              </td>

              <td className="p-4 text-slate-600">
                {contact.phone}
              </td>

              <td className="p-4 text-slate-600">
                {contact.date}
              </td>

              <td className="p-4 text-slate-600">
                {contact.time}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

}