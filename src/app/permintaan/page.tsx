"use client";

import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
import { useAuth } from "@/context/authContext";
import axios from "axios";
import { ListRestart, NotebookTabs, CheckCircle, XCircle, CheckSquare } from "lucide-react";
import React, { useState, useEffect } from "react";

type StatusType = {
  label: string;
  color: string;
};

const StatusEnum: Record<string, StatusType> = {
  MENUNGGU_KONFIRMASI: {
    label: "Menunggu Konfirmasi",
    color: "bg-yellow-200 text-yellow-800",
  },
  DITOLAK: {
    label: "Ditolak",
    color: "bg-red-200 text-red-800",
  },
  DITERIMA: {
    label: "Diterima",
    color: "bg-green-200 text-green-800",
  },
  KANTONG_SIAP: {
    label: "Kantong Siap",
    color: "bg-blue-200 text-blue-800",
  },
  SELESAI: {
    label: "Selesai",
    color: "bg-gray-200 text-gray-800",
  },
};

interface RequestData {
  no: number;
  id: string;
  patient_name: string;
  blood_type: string;
  quantity: number;
  blood_bags_fulfilled: number;
  created_at: string;
  expiry_date: string;
  permintaanDibuatFormatted: string;
  permintaanBerakhirFormatted: string;
  status: StatusType;
  unique_code_verified?: boolean; // New field to track if unique code is verified
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

const parseFormattedDate = (formattedDate: string): string => {
  if (!formattedDate) return "";

  const parts = formattedDate.split(" ");

  if (parts.length !== 3) return "";

  const day = parts[0].padStart(2, "0");

  const monthsIndonesian: Record<string, string> = {
    Januari: "01",
    Februari: "02",
    Maret: "03",
    April: "04",
    Mei: "05",
    Juni: "06",
    Juli: "07",
    Agustus: "08",
    September: "09",
    Oktober: "10",
    November: "11",
    Desember: "12",
  };

  const month = monthsIndonesian[parts[1]];
  const year = parts[2];

  return `${year}-${month}-${day}`;
};

const Permintaan: React.FC = () => {
  const { user } = useAuth();
  const columns = [
    "No",
    "Nama",
    "Golongan Darah",
    "Jumlah Darah",
    "Permintaan Dibuat",
    "Permintaan Berakhir",
    "Status",
    "Aksi",
  ];

  const [filters, setFilters] = useState<{
    golonganDarah: string;
    statusKey: string;
    permintaanDibuat: string;
    permintaanBerakhir: string;
  }>({
    golonganDarah: "",
    statusKey: "",
    permintaanDibuat: "",
    permintaanBerakhir: "",
  });

  const [data, setData] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [showUniqueCodeInput, setShowUniqueCodeInput] = useState<string | null>(null);
  const [uniqueCode, setUniqueCode] = useState<string>("");

  const fetchRequests = async () => {
    if (user) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/bloodReq/partner/${user.id}`
        );

        const dataResponse = response.data;
        const formattedData = dataResponse.data.map((item: any) => {
          let statusKey = item.status;

          switch (statusKey) {
            case "pending":
              statusKey = "MENUNGGU_KONFIRMASI";
              break;
            case "cancelled":
              statusKey = "DITOLAK";
              break;
            case "confirmed":
              statusKey = "DITERIMA";
              break;
            case "ready":
              statusKey = "KANTONG_SIAP";
              break;
            case "completed":
              statusKey = "SELESAI";
              break;
            default:
              break;
          }

          return {
            ...item,
            permintaanDibuatFormatted: formatDate(item.created_at),
            permintaanBerakhirFormatted: formatDate(item.expiry_date),
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
    fetchRequests();
  }, [user]);

  const handleValidateRequest = async (
    requestId: string,
    status: "verified" | "rejected"
  ) => {
    try {
      setLoading((prev) => ({ ...prev, [requestId]: true }));

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/partners/confirm/${requestId}`,
        { status }
      );

      fetchRequests();
    } catch (error) {
      console.error("Error validating request:", error);
    } finally {
      setLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleVerifyUniqueCode = async (requestId: string) => {
    try {
      setLoading((prev) => ({ ...prev, [requestId]: true }));

      // console.log("Verifying unique code:", uniqueCode);
      // console.log(process.env.NEXT_PUBLIC_API_URL);
      // console.log(`${process.env.NEXT_PUBLIC_API_URL}/bloodReq/verifyUniqueCode/${requestId}`)

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/bloodReq/verifyUniqueCode/${requestId}`,
        { unique_code: uniqueCode }
      );

      console.log("Response:", response.data);

      if (response.data.status == "SUCCESS") {
        // Update the local data to mark this request as verified
        setData(prevData => 
          prevData.map(item => 
            item.id === requestId 
              ? { ...item, unique_code_verified: true } 
              : item
          )
        );
        
        setShowUniqueCodeInput(null);
        setUniqueCode("");
        // toast.success("Unique code verified successfully"); // Uncomment if using toast
      }
    } catch (error) {
      console.error("Error verifying unique code:", error);
      // toast.error("Failed to verify unique code"); // Uncomment if using toast
    } finally {
      setLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    try {
      setLoading((prev) => ({ ...prev, [requestId]: true }));

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/bloodReq/status/${requestId}`,
        { status: "completed" }
      );

      fetchRequests();
    } catch (error) {
      console.error("Error completing request:", error);
      // toast.error("Failed to complete request"); // Uncomment if using toast
    } finally {
      setLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const filteredData = data.filter((row) => {
    if (filters.golonganDarah && row.blood_type !== filters.golonganDarah) {
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

    if (filters.permintaanDibuat && row.created_at < filters.permintaanDibuat) {
      return false;
    }

    if (
      filters.permintaanBerakhir &&
      row.expiry_date > filters.permintaanBerakhir
    ) {
      return false;
    }

    return true;
  });

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6">
        <h2 className="font-bold text-3xl text-white">Daftar Permintaan</h2>

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
              <option value="O-">O-</option>
              <option value="B+">B+</option>
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
            <label className="text-xs text-gray-600">Permintaan Dibuat</label>
            <input
              type="date"
              className="border border-gray-300 rounded-xl p-2"
              value={filters.permintaanDibuat}
              onChange={(e) =>
                setFilters({ ...filters, permintaanDibuat: e.target.value })
              }
            />
          </div>

          <div className="flex flex-col text-sm gap-1">
            <label className="text-xs text-gray-600">Permintaan Berakhir</label>
            <input
              type="date"
              className="border border-gray-300 rounded-xl p-2"
              value={filters.permintaanBerakhir}
              onChange={(e) =>
                setFilters({ ...filters, permintaanBerakhir: e.target.value })
              }
            />
          </div>

          <button
            className="bg-blue-500 cursor-pointer text-sm text-white px-4 py-2 rounded-xl hover:bg-blue-600 flex gap-2 items-center"
            onClick={() =>
              setFilters({
                golonganDarah: "",
                statusKey: "",
                permintaanDibuat: "",
                permintaanBerakhir: "",
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
                    <td className="p-4">{row.no}</td>
                    <td className="p-4">{row.patient_name}</td>
                    <td className="p-4">{row.blood_type}</td>
                    <td className="p-4">{row.quantity}</td>
                    <td className="p-4">{row.permintaanDibuatFormatted}</td>
                    <td className="p-4">{row.permintaanBerakhirFormatted}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-xl text-sm font-medium ${row.status.color}`}
                      >
                        {row.status.label}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2">
                      {row.status.label === "Menunggu Konfirmasi" && (
                        <>
                          <button
                            className="flex gap-2 items-center bg-red-800 hover:scale-105 text-white text-sm py-2 px-4 rounded-xl cursor-pointer duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() =>
                              handleValidateRequest(row.id, "rejected")
                            }
                            disabled={loading[row.id]}
                          >
                            <XCircle width={16} height={16} />
                            <p>{loading[row.id] ? "Memproses..." : "Tolak"}</p>
                          </button>
                          <button
                            className="flex gap-2 items-center bg-green-700 hover:scale-105 text-white text-sm py-2 px-4 rounded-xl cursor-pointer duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() =>
                              handleValidateRequest(row.id, "verified")
                            }
                            disabled={loading[row.id]}
                          >
                            <CheckCircle width={16} height={16} />
                            <p>{loading[row.id] ? "Memproses..." : "Terima"}</p>
                          </button>
                        </>
                      )}
                      {row.status.label === "Diterima" && (
                        <>
                          <button
                            className="flex gap-2 items-center bg-blue-800 hover:scale-105 text-white text-sm py-2 px-4 rounded-xl cursor-pointer duration-200"
                            onClick={() => setShowUniqueCodeInput(row.id)}
                          >
                            <CheckCircle width={16} height={16} />
                            <p>Verifikasi Kode</p>
                          </button>
                          <button
                            className="flex gap-2 items-center bg-red-800 hover:scale-105 text-white text-sm py-2 px-4 rounded-xl cursor-pointer duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() =>
                              handleValidateRequest(row.id, "rejected")
                            }
                            disabled={loading[row.id]}
                          >
                            <XCircle width={16} height={16} />
                            <p>{loading[row.id] ? "Memproses..." : "Batalkan"}</p>
                          </button>
                        </>
                      )}
                      {row.status.label === "Kantong Siap" && (
                        <>
                          {row.unique_code_verified ? (
                            <button
                              className="flex gap-2 items-center bg-green-700 hover:scale-105 text-white text-sm py-2 px-4 rounded-xl cursor-pointer duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleCompleteRequest(row.id)}
                              disabled={loading[row.id]}
                            >
                              <CheckSquare width={16} height={16} />
                              <p>{loading[row.id] ? "Memproses..." : "Selesai"}</p>
                            </button>
                          ) : (
                            <button
                              className="flex gap-2 items-center bg-blue-800 hover:scale-105 text-white text-sm py-2 px-4 rounded-xl cursor-pointer duration-200"
                              onClick={() => setShowUniqueCodeInput(row.id)}
                            >
                              <CheckCircle width={16} height={16} />
                              <p>Verifikasi Kode</p>
                            </button>
                          )}
                          <button
                            className="flex gap-2 items-center bg-red-800 hover:scale-105 text-white text-sm py-2 px-4 rounded-xl cursor-pointer duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() =>
                              handleValidateRequest(row.id, "rejected")
                            }
                            disabled={loading[row.id]}
                          >
                            <XCircle width={16} height={16} />
                            <p>{loading[row.id] ? "Memproses..." : "Batalkan"}</p>
                          </button>
                        </>
                      )}
                      {row.status.label !== "Menunggu Konfirmasi" &&
                        row.status.label !== "Diterima" &&
                        row.status.label !== "Kantong Siap" && (
                          <span className="text-sm text-gray-500">
                            Permintaan sudah diproses
                          </span>
                        )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    Tidak ada data yang sesuai dengan filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Centered Modal for Unique Code Input */}
        {showUniqueCodeInput && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
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

export default Permintaan;