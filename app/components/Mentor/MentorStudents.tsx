import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import { useTheme } from "next-themes";
import { useGetMentorStudentsQuery } from "@/redux/features/mentor/mentorApi";
import Loader from "@/app/components/Loader/Loader";

const MentorStudents = () => {
  const { theme } = useTheme();
  const { isLoading, data } = useGetMentorStudentsQuery({}, { refetchOnMountOrArgChange: true });
  const [studentsData, setStudentsData] = useState<any[]>([]);

  useEffect(() => {
    if (data && data.students) {
      // Chuyển đổi dữ liệu để hiển thị trong DataGrid
      const rows: React.SetStateAction<any[]> = [];
      
      data.students.forEach((student: any) => {
        student.courses.forEach((course: any) => {
          rows.push({
            id: `${student._id}-${course.courseId}`, // Tạo ID duy nhất
            userId: student._id,
            name: student.name,
            email: student.email,
            courseId: course.courseId,
            courseName: course.courseName,
            purchaseDate: new Date(course.purchaseDate),
            price: course.price
          });
        });
      });
      
      setStudentsData(rows);
    }
  }, [data]);

  const columns = [
    { field: "name", headerName: "Tên học viên", flex: 0.8 },
    { field: "email", headerName: "Email", flex: 0.8 },
    { field: "courseName", headerName: "Khóa học", flex: 1 },
    { 
      field: "purchaseDate", 
      headerName: "Ngày mua", 
      flex: 0.5,
      renderCell: (params: any) => {
        return new Date(params.row.purchaseDate).toLocaleDateString('vi-VN');
      }
    },
    { 
      field: "price", 
      headerName: "Giá", 
      flex: 0.3,
      renderCell: (params: any) => {
        return `${params.row.price.toLocaleString('vi-VN')}đ`;
      }
    },
  ];

  return (
    <div className="mt-[30px]">
      {isLoading ? (
        <Loader />
      ) : (
        <Box m="20px">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography
                variant="h2"
                color={theme === "dark" ? "#fff" : "#000"}
                fontWeight="bold"
                sx={{ m: "0 0 5px 0" }}
              >
                Học viên
              </Typography>
              <Typography variant="h5" color={theme === "dark" ? "#04d882" : "#1565c0"}>
                Danh sách học viên đã mua khóa học của bạn
              </Typography>
            </Box>
          </Box>
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
            <DataGrid rows={studentsData} columns={columns} />
          </Box>
        </Box>
      )}
    </div>
  );
};

export default MentorStudents;