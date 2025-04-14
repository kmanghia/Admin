import React, { FC, useEffect, useState } from "react";
import { Box, Typography, Button, TextField, Grid, MenuItem, Paper } from "@mui/material";
import { useTheme } from "next-themes";
import { useGetCourseForEditQuery, useUpdateCourseMutation } from "@/redux/features/mentor/mentorCoursesApi";
import Loader from "@/app/components/Loader/Loader";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
}

const EditCourse: FC<Props> = ({ id }) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { isLoading, data, refetch } = useGetCourseForEditQuery(id);
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();

  const [courseData, setCourseData] = useState({
    name: "",
    description: "",
    price: 0,
    estimatedPrice: 0,
    tags: "",
    level: "Beginner",
    demoUrl: "",
    benefits: [{ title: "" }],
    prerequisites: [{ title: "" }],
    thumbnail: null as File | null,
    thumbnailUrl: "",
  });

  useEffect(() => {
    if (data) {
      setCourseData({
        name: data.course.name || "",
        description: data.course.description || "",
        price: data.course.price || 0,
        estimatedPrice: data.course.estimatedPrice || 0,
        tags: (data.course.tags || []).join(","),
        level: data.course.level || "Beginner",
        demoUrl: data.course.demoUrl || "",
        benefits: data.course.benefits?.length > 0 
          ? data.course.benefits 
          : [{ title: "" }],
        prerequisites: data.course.prerequisites?.length > 0 
          ? data.course.prerequisites 
          : [{ title: "" }],
        thumbnail: null,
        thumbnailUrl: data.course.thumbnail?.url || "",
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCourseData({ ...courseData, level: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseData({
        ...courseData,
        thumbnail: file,
        thumbnailUrl: URL.createObjectURL(file),
      });
    }
  };

  const handleBenefitChange = (index: number, value: string) => {
    const updatedBenefits = [...courseData.benefits];
    updatedBenefits[index] = { title: value };
    setCourseData({ ...courseData, benefits: updatedBenefits });
  };

  const handleAddBenefit = () => {
    setCourseData({
      ...courseData,
      benefits: [...courseData.benefits, { title: "" }],
    });
  };

  const handleRemoveBenefit = (index: number) => {
    const updatedBenefits = [...courseData.benefits];
    updatedBenefits.splice(index, 1);
    setCourseData({ ...courseData, benefits: updatedBenefits });
  };

  const handlePrerequisiteChange = (index: number, value: string) => {
    const updatedPrerequisites = [...courseData.prerequisites];
    updatedPrerequisites[index] = { title: value };
    setCourseData({ ...courseData, prerequisites: updatedPrerequisites });
  };

  const handleAddPrerequisite = () => {
    setCourseData({
      ...courseData,
      prerequisites: [...courseData.prerequisites, { title: "" }],
    });
  };

  const handleRemovePrerequisite = (index: number) => {
    const updatedPrerequisites = [...courseData.prerequisites];
    updatedPrerequisites.splice(index, 1);
    setCourseData({ ...courseData, prerequisites: updatedPrerequisites });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create FormData
    const formData = new FormData();
    formData.append("name", courseData.name);
    formData.append("description", courseData.description);
    formData.append("price", courseData.price.toString());
    formData.append("estimatedPrice", courseData.estimatedPrice.toString());
    formData.append("tags", courseData.tags);
    formData.append("level", courseData.level);
    formData.append("demoUrl", courseData.demoUrl);
    
    // Add benefits and prerequisites
    formData.append("benefits", JSON.stringify(courseData.benefits));
    formData.append("prerequisites", JSON.stringify(courseData.prerequisites));
    
    // Add thumbnail if it exists
    if (courseData.thumbnail) {
      formData.append("thumbnail", courseData.thumbnail);
    }
    
    try {
      await updateCourse({ courseId: id, data: formData });
      toast.success("Cập nhật khóa học thành công");
      router.push("/mentor/courses");
    } catch (error: any) {
      toast.error(error?.data?.message || "Lỗi khi cập nhật khóa học");
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <Box m="20px">
          <Box mb="20px">
            <Typography
              variant="h2"
              color={theme === "dark" ? "#fff" : "#000"}
              fontWeight="bold"
              sx={{ m: "0 0 5px 0" }}
            >
              Chỉnh sửa khóa học
            </Typography>
            <Typography variant="h5" color={theme === "dark" ? "#04d882" : "#1565c0"}>
              Cập nhật thông tin khóa học của bạn
            </Typography>
          </Box>
          
          <Paper 
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
              color: theme === "dark" ? "#fff" : "#000",
            }}
          >
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên khóa học"
                    name="name"
                    value={courseData.name}
                    onChange={handleChange}
                    required
                    InputLabelProps={{
                      style: { color: theme === "dark" ? "#fff" : undefined },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mô tả"
                    name="description"
                    value={courseData.description}
                    onChange={handleChange}
                    required
                    multiline
                    rows={4}
                    InputLabelProps={{
                      style: { color: theme === "dark" ? "#fff" : undefined },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Giá (VND)"
                    name="price"
                    type="number"
                    value={courseData.price}
                    onChange={handleChange}
                    required
                    InputLabelProps={{
                      style: { color: theme === "dark" ? "#fff" : undefined },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Giá gốc (VND)"
                    name="estimatedPrice"
                    type="number"
                    value={courseData.estimatedPrice}
                    onChange={handleChange}
                    InputLabelProps={{
                      style: { color: theme === "dark" ? "#fff" : undefined },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tags (cách nhau bởi dấu phẩy)"
                    name="tags"
                    value={courseData.tags}
                    onChange={handleChange}
                    InputLabelProps={{
                      style: { color: theme === "dark" ? "#fff" : undefined },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Trình độ"
                    name="level"
                    value={courseData.level}
                    onChange={handleLevelChange}
                    required
                    InputLabelProps={{
                      style: { color: theme === "dark" ? "#fff" : undefined },
                    }}
                  >
                    <MenuItem value="Beginner">Người mới</MenuItem>
                    <MenuItem value="Intermediate">Trung cấp</MenuItem>
                    <MenuItem value="Advanced">Nâng cao</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Demo URL (Video giới thiệu)"
                    name="demoUrl"
                    value={courseData.demoUrl}
                    onChange={handleChange}
                    InputLabelProps={{
                      style: { color: theme === "dark" ? "#fff" : undefined },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" mb={2}>
                    Lợi ích của khóa học
                  </Typography>
                  {courseData.benefits.map((benefit, index) => (
                    <Box key={index} display="flex" mb={2}>
                      <TextField
                        fullWidth
                        label={`Lợi ích ${index + 1}`}
                        value={benefit.title}
                        onChange={(e) => handleBenefitChange(index, e.target.value)}
                        InputLabelProps={{
                          style: { color: theme === "dark" ? "#fff" : undefined },
                        }}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ ml: 1 }}
                        onClick={() => handleRemoveBenefit(index)}
                        disabled={courseData.benefits.length <= 1}
                      >
                        Xóa
                      </Button>
                    </Box>
                  ))}
                  <Button variant="outlined" color="primary" onClick={handleAddBenefit}>
                    Thêm lợi ích
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" mb={2}>
                    Yêu cầu tiên quyết
                  </Typography>
                  {courseData.prerequisites.map((prerequisite, index) => (
                    <Box key={index} display="flex" mb={2}>
                      <TextField
                        fullWidth
                        label={`Yêu cầu ${index + 1}`}
                        value={prerequisite.title}
                        onChange={(e) => handlePrerequisiteChange(index, e.target.value)}
                        InputLabelProps={{
                          style: { color: theme === "dark" ? "#fff" : undefined },
                        }}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ ml: 1 }}
                        onClick={() => handleRemovePrerequisite(index)}
                        disabled={courseData.prerequisites.length <= 1}
                      >
                        Xóa
                      </Button>
                    </Box>
                  ))}
                  <Button variant="outlined" color="primary" onClick={handleAddPrerequisite}>
                    Thêm yêu cầu
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" mb={2}>
                    Hình ảnh khóa học
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Button
                      variant="contained"
                      component="label"
                      sx={{
                        backgroundColor: theme === "dark" ? "#04d882" : "#1565c0",
                        "&:hover": {
                          backgroundColor: theme === "dark" ? "#03b66f" : "#0d47a1",
                        },
                      }}
                    >
                      Chọn file
                      <input 
                        type="file" 
                        hidden 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {(courseData.thumbnailUrl) && (
                      <Box ml={2} width={100} height={70}>
                        <img 
                          src={courseData.thumbnailUrl}
                          alt="Thumbnail preview"
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            borderRadius: '4px' 
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} display="flex" justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="inherit"
                    sx={{ mr: 2 }}
                    onClick={() => router.push("/mentor/courses")}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      backgroundColor: theme === "dark" ? "#04d882" : "#1565c0",
                      "&:hover": {
                        backgroundColor: theme === "dark" ? "#03b66f" : "#0d47a1",
                      },
                    }}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>
      )}
    </>
  );
};

export default EditCourse; 