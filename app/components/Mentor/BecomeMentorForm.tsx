"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useRegisterAsMentorMutation } from "@/redux/features/mentor/mentorApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { styles } from "@/app/styles/style";
import { useRouter } from "next/navigation";

const specializationOptions = [
  "Lập trình Web",
  "Phát triển Mobile",
  "Thiết kế UI/UX",
  "Phân tích dữ liệu",
  "DevOps",
  "Trí tuệ nhân tạo",
  "Machine Learning",
  "Cloud Computing",
  "Blockchain",
  "Internet of Things",
  "Bảo mật mạng",
  "Game Development",
];

const validationSchema = Yup.object({
  email: Yup.string().email("Email không hợp lệ").when('isNewUser', {
    is: true,
    then: (schema) => schema.required("Email là bắt buộc"),
  }),
  name: Yup.string().when('isNewUser', {
    is: true,
    then: (schema) => schema.required("Tên là bắt buộc"),
  }),
  password: Yup.string().when('isNewUser', {
    is: true,
    then: (schema) => schema.min(6, "Mật khẩu ít nhất 6 ký tự").required("Mật khẩu là bắt buộc"),
  }),
  bio: Yup.string()
    .min(50, "Giới thiệu bản thân ít nhất 50 ký tự")
    .required("Giới thiệu bản thân là bắt buộc"),
  specialization: Yup.array()
    .min(1, "Vui lòng chọn ít nhất một lĩnh vực chuyên môn")
    .required("Lĩnh vực chuyên môn là bắt buộc"),
  experience: Yup.number()
    .min(0, "Số năm kinh nghiệm không được âm")
    .required("Số năm kinh nghiệm là bắt buộc"),
  achievements: Yup.array().required("Thành tựu là bắt buộc"),
});

const BecomeMentorForm = () => {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [achievement, setAchievement] = useState("");
  const [registerAsMentor, { isLoading, isSuccess, error }] = useRegisterAsMentorMutation();
  const router = useRouter();

  useEffect(() => {
    if (isSuccess) {
      toast.success("Đăng ký làm mentor thành công! ");
      router.push("/");
    }
    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData?.data?.message || "Đã xảy ra lỗi");
      }
    }
  }, [isSuccess, error, router]);

  const handleSpecializationChange = (specialization: string) => {
    if (selectedSpecializations.includes(specialization)) {
      setSelectedSpecializations(
        selectedSpecializations.filter((item) => item !== specialization)
      );
    } else {
      setSelectedSpecializations([...selectedSpecializations, specialization]);
    }
  };

  const handleAddAchievement = () => {
    if (achievement.trim() !== "") {
      setAchievements([...achievements, achievement]);
      setAchievement("");
    }
  };

  const handleRemoveAchievement = (index: number) => {
    const newAchievements = [...achievements];
    newAchievements.splice(index, 1);
    setAchievements(newAchievements);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      bio: "",
      specialization: [] as string[],
      experience: 0,
      achievements: [] as string[],
      isNewUser: !isAuthenticated,
    },
    validationSchema,
    onSubmit: async (values) => {
      const formData = {
        ...values,
        specialization: selectedSpecializations,
        achievements,
        isNewUser: !isAuthenticated,
      };
      
      await registerAsMentor(formData);
    },
  });

  useEffect(() => {
    formik.setFieldValue("specialization", selectedSpecializations);
  }, [selectedSpecializations]);

  useEffect(() => {
    formik.setFieldValue("achievements", achievements);
  }, [achievements]);

  return (
    <div className="w-full">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Hiển thị form đăng ký nếu chưa đăng nhập */}
        {!isAuthenticated && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold dark:text-white">Thông tin tài khoản</h2>
            
            <div>
              <label className={styles.label} htmlFor="name">
                Họ và tên
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Nguyễn Văn A"
                className={`${formik.touched.name && formik.errors.name ? "border-red-500" : ""} ${styles.input}`}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
              )}
            </div>
            
            <div>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="email@example.com"
                className={`${formik.touched.email && formik.errors.email ? "border-red-500" : ""} ${styles.input}`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>
            
            <div className="relative">
              <label className={styles.label} htmlFor="password">
                Mật khẩu
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Mật khẩu ít nhất 6 ký tự"
                className={`${formik.touched.password && formik.errors.password ? "border-red-500" : ""} ${styles.input}`}
              />
              <div
                className="absolute right-2 top-[38px] cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
              )}
            </div>
            
            <div className="border-b border-gray-300 dark:border-gray-700 my-6"></div>
          </div>
        )}

        {/* Thông tin mentor */}
        <h2 className="text-xl font-semibold dark:text-white">Thông tin Mentor</h2>
        
        <div>
          <label className={styles.label} htmlFor="bio">
            Giới thiệu bản thân
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formik.values.bio}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Giới thiệu về bản thân, kinh nghiệm, kỹ năng và lý do bạn muốn trở thành mentor..."
            className={`${formik.touched.bio && formik.errors.bio ? "border-red-500" : ""} ${styles.input}`}
          />
          {formik.touched.bio && formik.errors.bio && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.bio}</p>
          )}
        </div>
        
        <div>
          <label className={styles.label}>Lĩnh vực chuyên môn</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {specializationOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={option}
                  checked={selectedSpecializations.includes(option)}
                  onChange={() => handleSpecializationChange(option)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor={option} className="dark:text-gray-300">
                  {option}
                </label>
              </div>
            ))}
          </div>
          {formik.touched.specialization && formik.errors.specialization && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.specialization}</p>
          )}
        </div>
        
        <div>
          <label className={styles.label} htmlFor="experience">
            Số năm kinh nghiệm
          </label>
          <input
            type="number"
            id="experience"
            name="experience"
            min="0"
            value={formik.values.experience}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`${formik.touched.experience && formik.errors.experience ? "border-red-500" : ""} ${styles.input}`}
          />
          {formik.touched.experience && formik.errors.experience && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.experience}</p>
          )}
        </div>
        
        <div>
          <label className={styles.label}>Thành tựu đạt được</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              placeholder="Ví dụ: Chứng chỉ Google Cloud Platform"
              className={styles.input}
            />
            <button
              type="button"
              onClick={handleAddAchievement}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Thêm
            </button>
          </div>
          
          {achievements.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="dark:text-gray-300">Danh sách thành tựu:</p>
              <ul className="list-disc pl-5 dark:text-gray-300">
                {achievements.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {formik.touched.achievements && formik.errors.achievements && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.achievements}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`${styles.button} w-full ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isLoading ? "Đang xử lý..." : "Đăng ký làm Mentor"}
        </button>
      </form>
    </div>
  );
};

export default BecomeMentorForm; 