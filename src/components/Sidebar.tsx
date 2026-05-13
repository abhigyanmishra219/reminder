'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Heading,
  Text,
  Flex,
  Button,
} from '@radix-ui/themes';

import {
  FileSpreadsheet,
  FolderOpen,
  Database,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';

type Upload = {
  uploadId: string;
  uploadName: string;
  count: number;
};

export default function Sidebar({
  onSelectUpload,
}: {
  onSelectUpload: (uploadId: string | null) => void;
}) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const res = await fetch('/api/uploads', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      setUploads(data.uploads || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = (uploadId: string) => {
    setSelected(uploadId);
    onSelectUpload(uploadId);
  };

  const handleDelete = async (
    uploadId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const confirmDelete = confirm(
      'Delete this upload and all its contacts?'
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/uploads/${uploadId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await res.json();

      if (result.success) {
        setUploads((prev) =>
          prev.filter((u) => u.uploadId !== uploadId)
        );

        if (selected === uploadId) {
          setSelected(null);
          onSelectUpload(null);
        }
      } else {
        alert(result.message || 'Failed to delete');
      }
    } catch (err) {
      console.log(err);
      alert('Error deleting upload');
    }
  };

  return (
    <aside
      className={`
        relative h-screen flex-shrink-0
        border-r border-gray-200/70
        bg-gradient-to-b from-white via-slate-50 to-slate-100
        transition-all duration-300
        shadow-sm
        ${isOpen ? 'w-80' : 'w-24'}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          absolute -right-3 top-7 z-50
          flex items-center justify-center
          w-7 h-7 rounded-full
          bg-white border border-gray-200
          shadow-md hover:shadow-lg
          transition-all duration-300
        "
      >
        {isOpen ? (
          <ChevronLeft className="w-4 h-4 text-gray-700" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-700" />
        )}
      </button>

      <div className="h-full overflow-y-auto px-4 py-5">

        {/* HEADER */}
        <div className="mb-6">
          <Flex align="center" gap="3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>

            {isOpen && (
              <div>
                <Heading size="5" className="tracking-tight">
                  My Uploads
                </Heading>

                <Text size="2" color="gray">
                  Excel Contact Lists
                </Text>
              </div>
            )}
          </Flex>
        </div>

        {/* ALL CONTACTS BUTTON */}
        <Button
          onClick={() => {
            setSelected(null);
            onSelectUpload(null);
          }}
          className={`
            !h-12 !rounded-2xl !font-semibold
            !transition-all !duration-300
            ${
              isOpen
                ? '!w-full'
                : '!w-12 !min-w-12 !p-0 mx-auto flex justify-center'
            }
          `}
          variant={selected === null ? 'solid' : 'outline'}
        >
          <Database className="w-4 h-4" />

          {isOpen && (
            <span className="ml-2">
              All Contacts
            </span>
          )}
        </Button>

        {/* EMPTY STATE */}
        {uploads.length === 0 && (
          <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-white/70 p-8 text-center">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400 mb-3" />

            {isOpen && (
              <>
                <Text
                  weight="medium"
                  className="block text-gray-700"
                >
                  No uploads yet
                </Text>

                <Text size="2" color="gray">
                  Upload your first Excel file
                </Text>
              </>
            )}
          </div>
        )}

        {/* UPLOAD LIST */}
        <div className="mt-5 space-y-4">
          {uploads.map((up) => {
            const isSelected =
              selected === up.uploadId;

            return (
              <Card
                key={up.uploadId}
                onClick={() =>
                  handleClick(up.uploadId)
                }
                className={`
                  group relative overflow-hidden
                  cursor-pointer rounded-3xl
                  border transition-all duration-300
                  hover:-translate-y-1 hover:shadow-2xl
                  active:scale-[0.99]
                  ${
                    isSelected
                      ? `
                        border-blue-500
                        bg-gradient-to-br
                        from-blue-500
                        via-indigo-500
                        to-violet-600
                        shadow-xl shadow-blue-200/60
                      `
                      : `
                        border-gray-200
                        bg-white/80 backdrop-blur-xl
                        hover:border-blue-200
                      `
                  }
                `}
              >
                {/* Glow Effect */}
                <div
                  className={`
                    absolute inset-0 opacity-0
                    transition-opacity duration-500
                    bg-gradient-to-r
                    from-white/10 via-white/5 to-transparent
                    ${
                      isSelected
                        ? 'opacity-100'
                        : 'group-hover:opacity-100'
                    }
                  `}
                />

                {/* Active Border */}
                {isSelected && (
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-white rounded-r-full" />
                )}

                <div
                  className={`
                    relative z-10 flex items-center justify-between
                    ${
                      isOpen
                        ? 'px-4 py-4'
                        : 'py-4 justify-center'
                    }
                  `}
                >
                  {/* LEFT SECTION */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">

                    {/* ICON */}
                    <div
                      className={`
                        relative flex items-center justify-center
                        rounded-2xl transition-all duration-300
                        ${
                          isOpen
                            ? 'w-14 h-14'
                            : 'w-12 h-12'
                        }
                        ${
                          isSelected
                            ? `
                              bg-white/20
                              backdrop-blur-md
                            `
                            : `
                              bg-gradient-to-br
                              from-slate-100
                              to-gray-200
                              group-hover:from-blue-100
                              group-hover:to-indigo-100
                            `
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 rounded-2xl border border-white/20 animate-pulse" />
                      )}

                      <FileSpreadsheet
                        className={`
                          transition-all duration-300
                          ${
                            isSelected
                              ? 'text-white w-6 h-6'
                              : 'text-blue-700 w-5 h-5 group-hover:scale-110'
                          }
                        `}
                      />
                    </div>

                    {/* TEXT */}
                    {isOpen && (
                      <div className="min-w-0 flex-1">
                        <p
                          className={`
                            truncate text-[15px]
                            font-semibold tracking-tight
                            ${
                              isSelected
                                ? 'text-white'
                                : 'text-gray-800'
                            }
                          `}
                        >
                          {up.uploadName}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5">

                          <div
                            className={`
                              w-2 h-2 rounded-full
                              ${
                                isSelected
                                  ? 'bg-white/80'
                                  : 'bg-emerald-500'
                              }
                            `}
                          />

                          <span
                            className={`
                              text-[11px]
                              uppercase tracking-wider
                              ${
                                isSelected
                                  ? 'text-blue-100'
                                  : 'text-gray-500'
                              }
                            `}
                          >
                            Excel Upload
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT SECTION */}
                  {isOpen && (
                    <div className="flex items-center gap-2 ml-3">

                      {/* COUNT */}
                      <div
                        className={`
                          flex items-center justify-center
                          min-w-[44px] h-10 px-3
                          rounded-2xl text-sm font-bold
                          transition-all duration-300
                          ${
                            isSelected
                              ? `
                                bg-white/20
                                text-white
                                backdrop-blur-md
                              `
                              : `
                                bg-gray-100
                                text-gray-700
                                group-hover:bg-blue-100
                                group-hover:text-blue-700
                              `
                          }
                        `}
                      >
                        {up.count}
                      </div>

                      {/* DELETE */}
                      <button
                        onClick={(e) =>
                          handleDelete(
                            up.uploadId,
                            e
                          )
                        }
                        className={`
                          flex items-center justify-center
                          w-10 h-10 rounded-2xl
                          transition-all duration-300
                          ${
                            isSelected
                              ? `
                                bg-white/15
                                text-white
                                hover:bg-red-500
                              `
                              : `
                                bg-red-50
                                text-red-500
                                hover:bg-red-500
                                hover:text-white
                              `
                          }
                        `}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </aside>
  );
}