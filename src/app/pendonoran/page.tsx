"use client";

import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import { useAuth } from "@/context/authContext";
import axios from "axios";
import { ListRestart, CheckCircle, XCircle, CheckSquare } from "lucide-react";
import React, { useState, useEffect } from "react";

type StatusType = {
  label: string;
  color: string;
};

const StatusEnum: Record<string, StatusType> = {
  ON_PROGRESS: {
    label: "Dalam Proses",
    color: "bg-yellow-200 text-yellow-800",
  },
  COMPLETED: {
    label: "Selesai",
    color: "bg-green-200 text-green-800",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "bg-red-200 text-red-800",
  },
};

interface DonorData {
  id: string;
  user_id: string;
  request_id: string;
  status: string;
  health_notes: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  phone_number: string;
  unique_code: string;
  unique_code_verified?: boolean;
  blood_requests: {
    id: string;
    blood_type: string;
    status: string;
  };
}

const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return date.toLocaleDateString("id-ID", options);
};

const Pendonoran: React.FC = () => {
  const { user } = useAuth();
  const columns = [
    "No",
    "Nama Pendonor",
    "Golongan Darah",
    "No. HP",
    "Tanggal Donasi",
    "Status",
    "Aksi",
  ];

  const [filters, setFilters] = useState<{
    golonganDarah: string;
    statusKey: string;
    tanggalDonasi: string;
  }>({
    golonganDarah: "",
    statusKey: "",
    tanggalDonasi: "",
  });

  const [data, setData] = useState<DonorData[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [showUniqueCodeInput, setShowUniqueCodeInput] = useState<string | null>(null);
  const [uniqueCode, setUniqueCode] = useState<string>("");

  const fetchDonors = async () => {
    if (user) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/donor/partner/${user.id}`
        );

        const dataResponse = response.data;
        const formattedData = dataResponse.data.map((item: any, index: number) => {
          let statusKey = item.status.toUpperCase();

          switch (statusKey) {
            case "ON_PROGRESS":
              statusKey = "ON_PROGRESS";
              break;
            case "COMPLETED":
              statusKey = "COMPLETED";
              break;
            case "CANCELLED":
              statusKey = "CANCELLED";
              break;
            default:
              break;
          }

          return {
            ...item,
            no: index + 1,
            donationDateFormatted: formatDate(item.created_at),
            status: StatusEnum[statusKey] || {
              label: "Tidak Diketahui",
              color: "bg-gray-200 text-gray-800",
            },
            unique_code_verified: item.unique_code_verified || false,
          };
        });

        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setData([]);
      }
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [user]);

  const handleUpdateStatus = async (
    donorId: string,
    status: "completed" | "cancelled"
  ) => {
    try {
      setLoading((prev) => ({ ...prev, [donorId]: true }));

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/donor/${donorId}/status`,
        { status }
      );

      fetchDonors();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [donorId]: false }));
    }
  };

  const handleVerifyUniqueCode = async (donorId: string) => {
    try {
      setLoading((prev) => ({ ...prev, [donorId]: true }));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/donor/verifyUniqueCode/${donorId}`,
        { unique_code: uniqueCode }
      );

      if (response.data.status === "SUCCESS") {
        // Update the local data to mark this donation as verified
        setData(prevData => 
          prevData.map(item => 
            item.id === donorId 
              ? { ...item, unique_code_verified: true } 
              : item
          )
        );
        
        setShowUniqueCodeInput(null);
        setUniqueCode("");
        // toast.success("Kode unik berhasil diverifikasi"); // Uncomment if using toast
      }
    } catch (error) {
      console.error("Error verifying unique code:", error);
      // toast.error("Gagal memverifikasi kode unik"); // Uncomment if using toast
    } finally {
      setLoading((prev) => ({ ...prev, [donorId]: false }));
    }
  };

  const filteredData = data.filter((row) => {
    if (filters.golonganDarah && row.blood_requests.blood_type !== filters.golonganDarah) {
      return false;
    }

    if (
      filters.statusKey &&
      Object.keys(StatusEnum).includes(filters.statusKey)
    ) {
      if (row.status.label !== StatusEnum[filters.statusKey].label) {
        return false;
      }
    }

    if (filters.tanggalDonasi) {
      const donationDate = new Date(row.created_at);
      donationDate.setHours(0, 0, 0, 0);
      
      const filterDate = new Date(filters.tanggalDonasi);
      filterDate.setHours(0, 0, 0, 0);
      
      if (donationDate.getTime() !== filterDate.getTime()) {
        return false;
      }
    }

    return true;
  });

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6">
        <h2 className="font-bold text-3xl text-white">Daftar Pendonoran</h2>

        {/* Filter Section */}
        <div className="flex gap-4 flex-wrap bg-gray-100 rounded-xl shadow-md py-3 px-4 items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-600">Golongan Darah</p>
            <select
              className="border border-gray-300 rounded-xl py-2 px-3 text-sm"
              value={filters.golonganDarah}
              onChange={(e) =>
                setFilters({ ...filters, golonganDarah: e.target.value })
              }
            >
              <option value="">Pilih Golongan Darah</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-600">Status</p>
            <select
              className="border border-gray-300 rounded-xl py-2 px-3 text-sm"
              value={filters.statusKey}
              onChange={(e) =>
                setFilters({ ...filters, statusKey: e.target.value })
              }
            >
              <option value="">Pilih Status</option>
              {Object.keys(StatusEnum).map((key) => (
                <option key={key} value={key}>
                  {StatusEnum[key].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col text-sm gap-1">
            <label className="text-xs text-gray-600">Tanggal Donasi</label>
            <input
              type="date"
              className="border border-gray-300 rounded-xl p-2"
              value={filters.tanggalDonasi}
              onChange={(e) =>
                setFilters({ ...filters, tanggalDonasi: e.target.value })
              }
            />
          </div>

          <button
            className="bg-blue-500 cursor-pointer text-sm text-white px-4 py-2 rounded-xl hover:bg-blue-600 flex gap-2 items-center"
            onClick={() =>
              setFilters({
                golonganDarah: "",
                statusKey: "",
                tanggalDonasi: "",
              })
            }
          >
            <ListRestart color="white" width={16} height={16} />
            <p>Reset Filter</p>
          </button>
        </div>

        {/* Table Section */}
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg">
          <table className="table-auto w-full border-collapse bg-white">
            <thead className="bg-gray-100 rounded-t-2xl">
              <tr className="border-b border-gray-300">
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className="px-4 py-6 text-left first:rounded-tl-2xl last:rounded-tr-2xl"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-300 ${
                      index === filteredData.length - 1
                        ? "last:rounded-b-2xl"
                        : ""
                    }`}
                  >
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{row.full_name}</td>
                    <td className="p-4">{row.blood_requests.blood_type}</td>
                    <td className="p-4">{row.phone_number}</td>
                    <td className="p-4">{row.donationDateFormatted}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-xl text-sm font-medium ${row.status.color}`}
                      >
                        {row.status.label}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      {row.status.label === "Dalam Proses" && (
                        <>
                          {row.unique_code_verified ? (
                            <button
                              className="flex gap-2 items-center bg-green-700 hover:scale-105 text-white text-sm py-2 px-4 rounded-xl cursor-pointer duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleUpdateStatus(row.id, "completed")}
                              disabled={loading[row.id]}
                            >
                              <CheckSquare width={16} height={16} />
                              <p>{loading[row.id] ? "Memproses..." : "Selesai"}</p>
                            </button>
                          ) : (
                            <button
                              className="flex gap-2 items-center bg-blue-700 hover:scale-105 text-white text-sm py-2 px-4 rounded-xl cursor-pointer duration-200"
                              onClick={() => setShowUniqueCodeInput(row.id)}
                            >
                              <CheckCircle width={16} height={16} />
                              <p>Verifikasi Kode</p>
                            </button>
                          )}
                          <button
                            className="flex gap-2 items-center bg-red-700 hover:scale-105 text-white text-sm py-2 px-4 rounded-xl cursor-pointer duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleUpdateStatus(row.id, "cancelled")}
                            disabled={loading[row.id]}
                          >
                            <XCircle width={16} height={16} />
                            <p>{loading[row.id] ? "Memproses..." : "Batalkan"}</p>
                          </button>
                        </>
                      )}
                      {row.status.label !== "Dalam Proses" && (
                        <span className="text-sm text-gray-500">
                          Pendonoran sudah diproses
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    Tidak ada data yang sesuai dengan filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Centered Modal for Unique Code Input */}
        {showUniqueCodeInput && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Verifikasi Kode Unik</h3>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={uniqueCode}
                  onChange={(e) => setUniqueCode(e.target.value)}
                  placeholder="Masukkan kode unik"
                  className="border border-gray-300 rounded-xl p-3 text-sm w-full"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    className="bg-gray-500 text-white text-sm py-2 px-4 rounded-xl hover:bg-gray-600"
                    onClick={() => {
                      setShowUniqueCodeInput(null);
                      setUniqueCode("");
                    }}
                  >
                    Batal
                  </button>
                  <button
                    className="bg-green-700 text-white text-sm py-2 px-4 rounded-xl hover:bg-green-800 disabled:opacity-50"
                    onClick={() => handleVerifyUniqueCode(showUniqueCodeInput)}
                    disabled={loading[showUniqueCodeInput] || !uniqueCode}
                  >
                    {loading[showUniqueCodeInput] ? "Memproses..." : "Verifikasi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Pendonoran;