import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { AiOutlineDelete } from "react-icons/ai";
import { useTheme } from "next-themes";
import { FiEdit2 } from "react-icons/fi";
import { format } from "timeago.js";
import { useRouter } from "next/navigation";
import { styles } from "@/app/styles/style";
import Loader from "@/app/components/Loader/Loader";
import { toast } from "react-hot-toast";
import {
  useGetPendingCoursesQuery,
  useUpdateCourseStatusMutation,
} from "@/redux/features/courses/courseApi";

type Props = {};

const PendingCourses = (props: Props) => {
  const { theme, setTheme } = useTheme();
  const { isLoading, data, refetch } = useGetPendingCoursesQuery({}, { refetchOnMountOrArgChange: true });
  const [updateCourseStatus] = useUpdateCourseStatusMutation();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [openModal, setOpenModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const router = useRouter();

  const handleApprove = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    try {
      await updateCourseStatus({ courseId: id, status: "active" });
      toast.success("Khóa học đã được phê duyệt");
      refetch();
    } catch (error) {
      toast.error("Lỗi khi phê duyệt khóa học");
    }
    setLoadingStates(prev => ({ ...prev, [id]: false }));
  };

  const openRejectModal = (id: string) => {
    setSelectedCourseId(id);
    setOpenModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setLoadingStates(prev => ({ ...prev, [selectedCourseId]: true }));
    try {
      await updateCourseStatus({
        courseId: selectedCourseId,
        status: "rejected",
        reason: rejectReason
      });
      toast.success("Khóa học đã bị từ chối");
      setOpenModal(false);
      setRejectReason("");
      setSelectedCourseId("");
      refetch();
    } catch (error) {
      toast.error("Lỗi khi từ chối khóa học");
    }
    setLoadingStates(prev => ({ ...prev, [selectedCourseId]: false }));
  };

  const handleViewCourse = (courseId: string) => {
    router.push(`/admin/edit-course/${courseId}`);
  };

  const handleViewMentor = (mentorId: string) => {
    router.push(`/admin/mentor-details/${mentorId}`);
  };

  const columns = [
    
    {
      field: "title",
      headerName: "Tên khóa học",
      flex: 0.5,
    },
    {
      field: "mentor",
      headerName: "Mentor",
      flex: 0.5,
      renderCell: (params: any) => {
        return (
          <div
            className="text-blue-500 underline cursor-pointer"
            onClick={() => handleViewMentor(params.row.mentorId)}
          >
            {params.row.mentor}
          </div>
        );
      },
    },
    {
      field: "price",
      headerName: "Giá",
      flex: 0.2,
    },
    {
      field: "createdAt",
      headerName: "Đăng ký",
      flex: 0.3,
    },
    {
      field: "details",
      headerName: "Chi tiết",
      flex: 0.2,
      renderCell: (params: any) => {
        return (
          <Button onClick={() => handleViewCourse(params.row.id)}>
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
            <Button
              onClick={() => handleApprove(params.row.id)}
              disabled={loadingStates[params.row.id]}
              className="!mr-2 !bg-green-500 !text-white !rounded !px-3 !py-1 !hover:bg-green-600"
            >
              {loadingStates[params.row.id] ? "Đang xử lý..." : "Duyệt"}
            </Button>
            <Button
              onClick={() => openRejectModal(params.row.id)}
              disabled={loadingStates[params.row.id]}
              className="!bg-red-500 !text-white !rounded !px-3 !py-1 !hover:bg-red-600"
            >
              {loadingStates[params.row.id] ? "Đang xử lý..." : "Từ chối"}
            </Button>
          </div>
        );
      },
    },
  ];

  const rows: any = [];

  if (data) {
    data.pendingCourses.forEach((item: any) => {
      rows.push({
        id: item._id,
        title: item.name,
        mentor: item.mentor.user.name,
        mentorId: item.mentor._id,
        price: `${item.price.toLocaleString('vi-VN')}đ`,
        createdAt: format(item.createdAt),
      });
    });
  }

  return (
    <div className="mt-[30px] ml-[40px]">
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
                Khóa học chờ duyệt
              </Typography>
              <Typography
                sx={{
                  fontSize: 14,
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              >
                Danh sách khóa học đang chờ phê duyệt
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
            <DataGrid 
              checkboxSelection 
              rows={rows} 
              columns={columns} 
              components={{ Toolbar: GridToolbar }}
            />
          </Box>
        </Box>
      )}

      {/* Modal từ chối */}
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setRejectReason("");
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: theme === "dark" ? "#1F2A40" : "white",
            borderRadius: "10px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ color: theme === "dark" ? "white" : "black" }}>
            Lý do từ chối khóa học
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối khóa học..."
            sx={{
              mt: 2,
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme === "dark" ? "#ffffff50" : "#00000050",
                },
                "&:hover fieldset": {
                  borderColor: theme === "dark" ? "#ffffff80" : "#00000080",
                },
                "& .MuiInputBase-input": {
                  color: theme === "dark" ? "white" : "black",
                },
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              onClick={() => {
                setOpenModal(false);
                setRejectReason("");
              }}
              sx={{ bgcolor: "#666", color: "white", "&:hover": { bgcolor: "#444" } }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleReject}
              sx={{ bgcolor: "#d32f2f", color: "white", "&:hover": { bgcolor: "#b71c1c" } }}
            >
              Xác nhận từ chối
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default PendingCourses; 