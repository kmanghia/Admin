import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  useGetMentorByIdQuery,
  useUpdateMentorStatusMutation,
} from "@/redux/features/mentor/mentorApi";
import Loader from "@/app/components/Loader/Loader";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { format } from "timeago.js";
import { styles } from "@/app/styles/style";
import { Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

type Props = {
  id: string;
};

const MentorDetails = ({ id }: Props) => {
  const { theme } = useTheme();
  const [updateMentorStatus] = useUpdateMentorStatusMutation();
  const { data, isLoading, error, refetch } = useGetMentorByIdQuery(id);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleApprove = async () => {
    setIsUpdating(true);
    try {
      await updateMentorStatus({ mentorId: id, status: "approved" });
      toast.success("Mentor đã được phê duyệt thành công");
      refetch();
    } catch (error) {
      toast.error("Lỗi khi phê duyệt mentor");
    }
    setIsUpdating(false);
  };

  const handleReject = async () => {
    setIsUpdating(true);
    try {
      await updateMentorStatus({ mentorId: id, status: "rejected" });
      toast.success("Mentor đã bị từ chối");
      refetch();
    } catch (error) {
      toast.error("Lỗi khi từ chối mentor");
    }
    setIsUpdating(false);
  };

  const courseColumns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    {
      field: "title",
      headerName: "Tên khóa học",
      flex: 0.5,
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 0.3,
      renderCell: (params: any) => {
        return (
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
        );
      }
    },
    {
      field: "price",
      headerName: "Giá",
      flex: 0.2,
    },
    {
      field: "purchased",
      headerName: "Đã bán",
      flex: 0.2,
    },
    {
      field: "ratings",
      headerName: "Đánh giá",
      flex: 0.2,
    },
    {
      field: "details",
      headerName: "Chi tiết",
      flex: 0.2,
      renderCell: (params: any) => {
        return (
          <Link href={`/admin/edit-course/${params.row.id}`} className="text-blue-500 underline">
            Xem
          </Link>
        );
      }
    }
  ];

  const courseRows: any = [];

  if (data?.mentor?.courses) {
    data.mentor.courses.forEach((item: any) => {
      courseRows.push({
        id: item._id,
        title: item.name,
        status: item.status,
        price: `${item.price.toLocaleString('vi-VN')}đ`,
        purchased: item.purchased,
        ratings: item.ratings,
      });
    });
  }

  const reviewColumns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    {
      field: "user",
      headerName: "Người đánh giá",
      flex: 0.5,
    },
    {
      field: "rating",
      headerName: "Điểm",
      flex: 0.3,
    },
    {
      field: "comment",
      headerName: "Nhận xét",
      flex: 0.8,
    },
    {
      field: "createdAt",
      headerName: "Thời gian",
      flex: 0.4,
    }
  ];

  const reviewRows: any = [];

  if (data?.mentor?.reviews) {
    data.mentor.reviews.forEach((item: any, index: number) => {
      reviewRows.push({
        id: index + 1,
        user: item.user.name,
        rating: item.rating,
        comment: item.comment,
        createdAt: format(item.createdAt),
      });
    });
  }

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <div>Có lỗi khi tải thông tin</div>
      ) : (
        <div className="mt-[30px]">
          <div className="w-[90%] m-auto">
            <div className="w-full flex">
              <div className="relative">
                <img
                  src={data?.mentor?.user?.avatar?.url || "/avatar.png"}
                  alt=""
                  className="w-[120px] h-[120px] rounded-full object-cover"
                />
              </div>
              <div className="ml-5 flex flex-col">
                <h5 className={`${styles.title} !text-[25px]`}>
                  {data?.mentor?.user?.name}
                </h5>
                <h5 className="dark:text-white text-black">
                  Email: {data?.mentor?.user?.email}
                </h5>
                <div className="flex items-center mt-2">
                  <div
                    className={`px-3 py-1 rounded ${
                      data?.mentor?.applicationStatus === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : data?.mentor?.applicationStatus === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Trạng thái: {data?.mentor?.applicationStatus === 'pending' 
                      ? 'Chờ duyệt' 
                      : data?.mentor?.applicationStatus === 'approved' 
                        ? 'Đã duyệt' 
                        : 'Đã từ chối'}
                  </div>
                  <p className="ml-4 dark:text-white text-black">
                    Đánh giá trung bình: {data?.mentor?.averageRating?.toFixed(1) || "Chưa có đánh giá"}
                  </p>
                </div>
                {data?.mentor?.applicationStatus === 'pending' && (
                  <div className="flex items-center mt-3">
                    <Button
                      onClick={handleApprove}
                      disabled={isUpdating}
                      className="!mr-2 !bg-green-500 !text-white !rounded !px-3 !py-2 !hover:bg-green-600"
                    >
                      {isUpdating ? "Đang xử lý..." : "Phê duyệt mentor"}
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={isUpdating}
                      className="!bg-red-500 !text-white !rounded !px-3 !py-2 !hover:bg-red-600"
                    >
                      {isUpdating ? "Đang xử lý..." : "Từ chối mentor"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 bg-slate-800 rounded p-5">
              <h3 className="text-white text-xl font-semibold">Thông tin chi tiết</h3>
              <div className="mt-3 grid grid-cols-2 gap-5">
                <div>
                  <p className="text-gray-400">Chuyên môn:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data?.mentor?.specialization?.map((item: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-900 rounded text-white text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400">Năm kinh nghiệm:</p>
                  <p className="text-white">{data?.mentor?.experience}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400">Giới thiệu:</p>
                  <p className="text-white">{data?.mentor?.bio}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400">Thành tựu:</p>
                  <ul className="text-white list-disc pl-5">
                    {data?.mentor?.achievements?.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-gray-400">Ngày đăng ký:</p>
                  <p className="text-white">{format(data?.mentor?.applicationDate)}</p>
                </div>
              </div>
            </div>

            <div className="my-5">
              <h3 className={`${styles.title} !text-[20px]`}>Khóa học ({data?.mentor?.courses?.length || 0})</h3>
              <div className="w-full mt-3">
                <DataGrid
                  rows={courseRows}
                  columns={courseColumns}
                  autoHeight
                  hideFooter={courseRows.length <= 10}
                  pageSizeOptions={[10]}
                  disableRowSelectionOnClick
                  sx={{
                    "& .MuiDataGrid-row": {
                      color: theme === "dark" ? "#fff" : "#000",
                      borderBottom: theme === "dark" ? "1px solid #ffffff30!important" : "1px solid #ccc!important",
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
                  }}
                />
              </div>
            </div>

            <div className="my-5">
              <h3 className={`${styles.title} !text-[20px]`}>Đánh giá ({data?.mentor?.reviews?.length || 0})</h3>
              <div className="w-full mt-3">
                <DataGrid
                  rows={reviewRows}
                  columns={reviewColumns}
                  autoHeight
                  hideFooter={reviewRows.length <= 10}
                  pageSizeOptions={[10]}
                  disableRowSelectionOnClick
                  sx={{
                    "& .MuiDataGrid-row": {
                      color: theme === "dark" ? "#fff" : "#000",
                      borderBottom: theme === "dark" ? "1px solid #ffffff30!important" : "1px solid #ccc!important",
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
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MentorDetails; 