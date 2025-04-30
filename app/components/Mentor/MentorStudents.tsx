import React, { useEffect, useState } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, Typography, TextField, InputAdornment, Button } from "@mui/material";
import { useTheme } from "next-themes";
import { useGetMentorStudentsQuery } from "@/redux/features/mentor/mentorApi";
import Loader from "@/app/components/Loader/Loader";
import { AiOutlineSearch, AiOutlineFileExcel } from "react-icons/ai";
import * as XLSX from 'xlsx';
import { toast } from "react-hot-toast";

const MentorStudents = () => {
  const { theme } = useTheme();
  const { isLoading, data } = useGetMentorStudentsQuery({}, { refetchOnMountOrArgChange: true });
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState<any[]>([]);

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
      setFilteredRows(rows); // Initialize filtered rows with all data
    }
  }, [data]);
  
  // Filter rows based on search term
  useEffect(() => {
    if (studentsData.length > 0) {
      if (!searchTerm) {
        setFilteredRows(studentsData);
        return;
      }
      
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = studentsData.filter((row: any) => {
        return (
          row.name.toLowerCase().includes(lowercasedSearch) ||
          row.email.toLowerCase().includes(lowercasedSearch) ||
          row.courseName.toLowerCase().includes(lowercasedSearch) ||
          new Date(row.purchaseDate).toLocaleDateString('vi-VN').includes(searchTerm) ||
          `${row.price.toLocaleString('vi-VN')}đ`.includes(searchTerm)
        );
      });
      
      setFilteredRows(filtered);
    }
  }, [searchTerm, studentsData]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };
  
  const exportToExcel = () => {
    try {
      // Create a simplified version of the data for Excel
      const exportData = filteredRows.map(row => ({
        'Tên học viên': row.name,
        'Email': row.email,
        'Khóa học': row.courseName,
        'Ngày mua': new Date(row.purchaseDate).toLocaleDateString('vi-VN'),
        'Giá': `${row.price.toLocaleString('vi-VN')}đ`
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
      
      // Column widths
      const colWidths = [
        { wch: 30 }, // Tên học viên
        { wch: 30 }, // Email
        { wch: 40 }, // Khóa học
        { wch: 15 }, // Ngày mua
        { wch: 15 }, // Giá
      ];
      
      worksheet['!cols'] = colWidths;
      
      // Generate file and trigger download
      XLSX.writeFile(workbook, "danh_sach_hoc_vien.xlsx");
      
      toast.success("Xuất file Excel thành công");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Có lỗi khi xuất file Excel");
    }
  };

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
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AiOutlineFileExcel />}
              sx={{
                color: theme === "dark" ? "#fff" : "#1565c0",
                borderColor: theme === "dark" ? "#fff" : "#1565c0",
                "&:hover": {
                  borderColor: theme === "dark" ? "#04d882" : "#1565c0",
                  backgroundColor: theme === "dark" ? "rgba(4, 216, 130, 0.1)" : "rgba(21, 101, 192, 0.1)",
                },
                borderRadius: "8px",
                padding: "8px 16px",
              }}
              onClick={exportToExcel}
            >
              Xuất Excel
            </Button>
          </Box>
          
          <Box sx={{ mt: 3, mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Tìm kiếm theo tên học viên, email, khóa học, ngày mua, giá..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AiOutlineSearch color={theme === "dark" ? "#fff" : "#1565c0"} size={24} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: "8px",
                  backgroundColor: theme === "dark" ? "#1F2A40" : "#F8F9FA",
                  color: theme === "dark" ? "#fff" : "#000",
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme === "dark" ? "#3e4396" : "#E0E3E7",
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme === "dark" ? "#04d882" : "#1565c0",
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme === "dark" ? "#04d882" : "#1565c0",
                  },
                }
              }}
            />
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
            <DataGrid 
              rows={filteredRows} 
              columns={columns} 
              components={{ Toolbar: GridToolbar }}
              componentsProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
            />
          </Box>
        </Box>
      )}
    </div>
  );
};

export default MentorStudents;