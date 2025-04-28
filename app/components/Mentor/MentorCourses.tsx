import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Typography, Modal } from "@mui/material";
import { AiOutlineDelete } from "react-icons/ai";
import { useTheme } from "next-themes";
import { FiEdit2 } from "react-icons/fi";
import { format } from "timeago.js";
import { useRouter } from "next/navigation";
import { styles } from "@/app/styles/style";
import {
  useGetPendingCoursesQuery,
  useSubmitCourseForApprovalMutation,
} from "@/redux/features/courses/courseApi";
import Loader from "@/app/components/Loader/Loader";
import { toast } from "react-hot-toast";
import { useGetMentorCoursesQuery } from "@/redux/features/mentor/mentorApi";
import { useDeleteCourseMutation } from "@/redux/features/mentor/mentorCoursesApi";

type Props = {};

const MentorCourses = (props: Props) => {
  const { theme, setTheme } = useTheme();
  const { isLoading, data, refetch } = useGetMentorCoursesQuery({}, { refetchOnMountOrArgChange: true });
  const [submitCourseForApproval] = useSubmitCourseForApprovalMutation();
  const [deleteCourse, { isSuccess: deleteSuccess, error: deleteError }] = useDeleteCourseMutation();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [courseIdToDelete, setCourseIdToDelete] = useState("");
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/mentor/edit-course/${id}`);
  };

  const handleSubmit = async (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    try {
      await submitCourseForApproval(id);
      toast.success("Khóa học đã được gửi để phê duyệt");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi gửi khóa học để phê duyệt");
    }
    setLoadingStates(prev => ({ ...prev, [id]: false }));
  };

  const handleDelete = async () => {
    if (!courseIdToDelete) return;
    try {
      await deleteCourse(courseIdToDelete);
      toast.success("Khóa học đã được xóa thành công");
      refetch();
      setOpenDeleteModal(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi xóa khóa học");
    }
  };

  const columns = [
    
    {
      field: "title",
      headerName: "Tên khóa học",
      flex: 0.8,
    },
    {
      field: "price",
      headerName: "Giá",
      flex: 0.3,
    },
    {
      field: "purchased",
      headerName: "Đã bán",
      flex: 0.3,
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 0.5,
      renderCell: (params: any) => {
        return (
          <div>
            <span className={`px-3 py-1 rounded ${
              params.row.status === 'draft' 
                ? 'bg-blue-100 text-blue-800' 
                : params.row.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : params.row.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
            }`}>
              {params.row.status === 'draft' 
                ? 'Nháp'
                : params.row.status === 'pending' 
                  ? 'Chờ duyệt' 
                  : params.row.status === 'active'
                    ? 'Hoạt động'
                    : 'Bị từ chối'}
            </span>
          </div>
        );
      }
    },
    {
      field: "ratings",
      headerName: "Đánh giá",
      flex: 0.3,
    },
    {
      field: "edit",
      headerName: "Chỉnh sửa",
      flex: 0.2,
      renderCell: (params: any) => {
        return (
          <Button onClick={() => handleEdit(params.row.id)}>
            <FiEdit2 className="dark:text-white text-black" size={20} />
          </Button>
        );
      },
    },
    {
      field: "delete",
      headerName: "Xóa",
      flex: 0.2,
      renderCell: (params: any) => {
        return (
          <Button
            onClick={() => {
              setCourseIdToDelete(params.row.id);
              setOpenDeleteModal(true);
            }}
            sx={{ 
              minWidth: 'auto',
              padding: '5px'
            }}
          >
            <AiOutlineDelete
              className="dark:text-red-400 text-red-600"
              size={20}
            />
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
          <div>
            {params.row.status === 'draft' && (
              <Button
                onClick={() => handleSubmit(params.row.id)}
                disabled={loadingStates[params.row.id]}
                className="!mr-2 !bg-green-500 !text-white !rounded !px-3 !py-1 !hover:bg-green-600"
              >
                {loadingStates[params.row.id] ? "Đang gửi..." : "Gửi để duyệt"}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const rows: any = [];

  if (data) {
    data.courses.forEach((item: any) => {
      rows.push({
        id: item._id,
        title: item.name,
        price: `${item.price.toLocaleString('vi-VN')}đ`,
        purchased: item.purchased,
        ratings: item.ratings?.toFixed(1) || "N/A",
        status: item.status,
      });
    });
  }

  return (
    <div className="mt-[30px]">
      {isLoading ? (
        <Loader />
      ) : (
        <Box m="20px">
          <div className="w-full flex justify-between">
            <div>
              <Typography
                variant="h2"
                color={theme === "dark" ? "#fff" : "#000"}
                fontWeight="bold"
                sx={{ m: "0 0 5px 0" }}
              >
                Khóa học của tôi
              </Typography>
              <Typography variant="h6" color={theme === "dark" ? "#04d882" : "#1565c0"}>
                Quản lý tất cả khóa học của bạn
              </Typography>
            </div>
            <div>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  backgroundColor: "#4CAF50",
                  boxShadow: "0px 4px 10px rgba(76, 175, 80, 0.25)",
                  "&:hover": {
                    backgroundColor: "#43A047",
                  },
                  borderRadius: "8px",
                  padding: "8px 16px",
                }}
                onClick={() => router.push("/mentor/create-course")}
              >
                Tạo khóa học mới
              </Button>
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
          
          {openDeleteModal && (
            <Modal
              open={openDeleteModal}
              onClose={() => setOpenDeleteModal(false)}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[450px] bg-white dark:bg-slate-900 rounded-[8px] shadow p-4 outline-none">
                <h1 className={`${styles.title}`}>
                  Bạn có chắc chắn muốn xóa khóa học này?
                </h1>
                <div className="flex w-full items-center justify-between mb-6 mt-4">
                  <div
                    className={`${styles.button} !w-[120px] h-[30px] bg-[#47d097]`}
                    onClick={() => setOpenDeleteModal(false)}
                  >
                    Hủy
                  </div>
                  <div
                    className={`${styles.button} !w-[120px] h-[30px] bg-[#d63f3f]`}
                    onClick={handleDelete}
                  >
                    Xóa
                  </div>
                </div>
              </Box>
            </Modal>
          )}
        </Box>
      )}
    </div>
  );
};

export default MentorCourses;