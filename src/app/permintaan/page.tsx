"use client";

import { ListRestart, NotebookTabs } from "lucide-react";
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
  DITOLAK: { label: "Ditolak", color: "bg-red-200 text-red-800" },
  DITERIMA: { label: "Diterima", color: "bg-green-200 text-green-800" },
};

interface RequestData {
  no: number;
  nama: string;
  golonganDarah: string;
  jumlahDarah: string;
  permintaanDibuat: string;
  permintaanBerakhir: string;
  permintaanDibuatFormatted: string;
  permintaanBerakhirFormatted: string;
  status: StatusType;
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

  const rawData = [
    {
      no: 1,
      nama: "John Doe",
      golonganDarah: "A+",
      jumlahDarah: "2 Kantong",
      permintaanDibuat: "2024-03-20",
      permintaanBerakhir: "2024-03-25",
      status: StatusEnum.MENUNGGU_KONFIRMASI,
    },
    {
      no: 2,
      nama: "Jane Smith",
      golonganDarah: "O-",
      jumlahDarah: "1 Kantong",
      permintaanDibuat: "2024-03-21",
      permintaanBerakhir: "2024-03-26",
      status: StatusEnum.DITOLAK,
    },
    {
      no: 3,
      nama: "Michael Johnson",
      golonganDarah: "B+",
      jumlahDarah: "3 Kantong",
      permintaanDibuat: "2024-03-22",
      permintaanBerakhir: "2024-03-27",
      status: StatusEnum.DITERIMA,
    },
  ];

  const [data, setData] = useState<RequestData[]>([]);

  useEffect(() => {
    const formattedData = rawData.map((item) => ({
      ...item,
      permintaanDibuatFormatted: formatDate(item.permintaanDibuat),
      permintaanBerakhirFormatted: formatDate(item.permintaanBerakhir),
    }));

    setData(formattedData);
  }, []);

  const filteredData = data.filter((row) => {
    if (filters.golonganDarah && row.golonganDarah !== filters.golonganDarah) {
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

    if (
      filters.permintaanDibuat &&
      row.permintaanDibuat < filters.permintaanDibuat
    ) {
      return false;
    }

    if (
      filters.permintaanBerakhir &&
      row.permintaanBerakhir > filters.permintaanBerakhir
    ) {
      return false;
    }

    return true;
  });

  return (
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
          <p className="text-xs text-gray-600">Golongan Darah</p>
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
                  <td className="p-4">{row.nama}</td>
                  <td className="p-4">{row.golonganDarah}</td>
                  <td className="p-4">{row.jumlahDarah}</td>
                  <td className="p-4">{row.permintaanDibuatFormatted}</td>
                  <td className="p-4">{row.permintaanBerakhirFormatted}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-xl text-sm font-medium ${row.status.color}`}
                    >
                      {row.status.label}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="flex gap-2 items-center bg-secondary hover:scale-105 text-white text-sm py-2 px-4 rounded-xl cursor-pointer duration-200">
                      <NotebookTabs color="white" width={16} height={16} />
                      <p>Detail</p>
                    </button>
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
    </div>
  );
};

export default Permintaan;
