import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Typography } from "@mui/material";
import { AiOutlineDelete } from "react-icons/ai";
import { useTheme } from "next-themes";
import { FiEdit2 } from "react-icons/fi";
import { format } from "timeago.js";
import { useRouter } from "next/navigation";
import { styles } from "@/app/styles/style";
import {
  useGetAllMentorsQuery,
  useUpdateMentorStatusMutation,
} from "@/redux/features/mentor/mentorApi";
import Loader from "@/app/components/Loader/Loader";
import { toast } from "react-hot-toast";

type Props = {};

const AllMentors = (props: Props) => {
  const { theme, setTheme } = useTheme();
  const [active, setActive] = useState(false);
  const [mentorId, setMentorId] = useState("");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [updateMentorStatus] = useUpdateMentorStatusMutation();
  const { isLoading, data, refetch } = useGetAllMentorsQuery({}, { refetchOnMountOrArgChange: true });
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const router = useRouter();

  const handleApprove = async (id: string) => {
    setIsApproving(true);
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    await updateMentorStatus({ mentorId: id, status: "approved" });
    toast.success("Mentor đã được phê duyệt thành công");
    refetch();
    setLoadingStates(prev => ({ ...prev, [id]: false }));
    setIsApproving(false);
  };

  const handleReject = async (id: string) => {
    setIsRejecting(true);
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    await updateMentorStatus({ mentorId: id, status: "rejected" });
    toast.success("Mentor đã bị từ chối");
    refetch();
    setLoadingStates(prev => ({ ...prev, [id]: false }));
    setIsRejecting(false);
  };
  
  const handleView = (id: string) => {
    router.push(`/admin/mentor-details/${id}`);
  };

  const columns = [
    
    {
      field: "name",
      headerName: "Tên mentor",
      flex: 0.5,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 0.5,
    },
    {
      field: "role",
      headerName: "Vai trò",
      flex: 0.5,
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 0.5,
      renderCell: (params: any) => {
        return (
          <div>
            <span className={`px-3 py-1 rounded ${
              params.row.status === 'pending' 
                ? 'bg-yellow-100 text-yellow-800' 
                : params.row.status === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
            }`}>
              {params.row.status === 'pending' 
                ? 'Chờ duyệt' 
                : params.row.status === 'approved' 
                  ? 'Đã duyệt' 
                  : 'Đã từ chối'}
            </span>
          </div>
        );
      }
    },
    {
      field: "createdAt",
      headerName: "Ngày đăng ký",
      flex: 0.5,
    },
    {
      field: " ",
      headerName: "Xem chi tiết",
      flex: 0.2,
      renderCell: (params: any) => {
        return (
          <Button onClick={() => handleView(params.row.id)}>
            <FiEdit2 className="dark:text-white text-black" size={20} />
          </Button>
        );
      },
    },
    {
      field: "actions",
      headerName: "Hành động",
      flex: 0.5,
      renderCell: (params: any) => {
        return (
          <div className="flex justify-between">
            {params.row.status === 'pending' && (
              <>
                <Button
                  onClick={() => handleApprove(params.row.id)}
                  disabled={loadingStates[params.row.id]}
                  className="!mr-2 !bg-green-500 !text-white !rounded !px-3 !py-1 !hover:bg-green-600"
                >
                  {loadingStates[params.row.id] && isApproving ? "Đang duyệt..." : "Duyệt"}
                </Button>
                <Button
                  onClick={() => handleReject(params.row.id)}
                  disabled={loadingStates[params.row.id]}
                  className="!bg-red-500 !text-white !rounded !px-3 !py-1 !hover:bg-red-600"
                >
                  {loadingStates[params.row.id] && isRejecting ? "Đang từ chối..." : "Từ chối"}
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const pendingColumns = columns.filter(col => col.field !== "role");

  const rows: any = [];

  if (data) {
    data.mentors.forEach((item: any) => {
      rows.push({
        id: item._id,
        name: item.user.name,
        email: item.user.email,
        role: "Mentor",
        status: item.applicationStatus,
        createdAt: format(item.applicationDate),
      });
    });
  }

  return (
    <div className="mt-[30px]">
      {isLoading ? (
        <Loader />
      ) : (
        <Box m="20px">
          <div className="w-full flex justify-between items-center">
            <div>
              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              >
                Tất cả Mentors
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              >
                Danh sách tất cả mentor trên hệ thống
              </Typography>
            </div>
          </div>
          <Box
            m="40px 0 0 0"
            height="75vh"
            sx={{
              "& .MuiDataGrid-root": {
                border: "none",
                outline: "none",
              },
              "& .css-pqjvzy-MuiSvgIcon-root-MuiSelect-icon": {
                color: theme === "dark" ? "#fff" : "#000",
              },
              "& .MuiDataGrid-sortIcon": {
                color: theme === "dark" ? "#fff" : "#000",
              },
              "& .MuiDataGrid-row": {
                color: theme === "dark" ? "#fff" : "#000",
                borderBottom:
                  theme === "dark"
                    ? "1px solid #ffffff30!important"
                    : "1px solid #ccc!important",
              },
              "& .MuiTablePagination-root": {
                color: theme === "dark" ? "#fff" : "#000",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "none",
              },
              "& .name-column--cell": {
                color: theme === "dark" ? "#fff" : "#000",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: theme === "dark" ? "#3e4396" : "#A4A9FC",
                borderBottom: "none",
                color: theme === "dark" ? "#fff" : "#000",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
              },
              "& .MuiDataGrid-footerContainer": {
                color: theme === "dark" ? "#fff" : "#000",
                borderTop: "none",
                backgroundColor: theme === "dark" ? "#3e4396" : "#A4A9FC",
              },
              "& .MuiCheckbox-root": {
                color:
                  theme === "dark" ? `#b7ebde !important` : `#000 !important`,
              },
              "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                color: `#fff !important`,
              },
            }}
          >
            <DataGrid checkboxSelection rows={rows} columns={columns} />
          </Box>
        </Box>
      )}
    </div>
  );
};

export default AllMentors; 