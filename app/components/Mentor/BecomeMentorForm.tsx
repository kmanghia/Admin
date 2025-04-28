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
      <form onSubmit={formik.handleSubmit} className="space-y-8">
        {/* Hiển thị form đăng ký nếu chưa đăng nhập */}
        {!isAuthenticated && (
          <div className="space-y-6 bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-blue-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Thông tin tài khoản
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
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
                className={`w-full px-4 py-3 rounded-lg border ${
                  formik.touched.name && formik.errors.name 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-blue-500"
                } focus:border-transparent focus:outline-none focus:ring-2 transition-all bg-white`}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
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
                className={`w-full px-4 py-3 rounded-lg border ${
                  formik.touched.email && formik.errors.email 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-blue-500"
                } focus:border-transparent focus:outline-none focus:ring-2 transition-all bg-white`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
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
                className={`w-full px-4 py-3 rounded-lg border ${
                  formik.touched.password && formik.errors.password 
                    ? "border-red-500 focus:ring-red-500" 
                    : "border-gray-300 focus:ring-blue-500"
                } focus:border-transparent focus:outline-none focus:ring-2 transition-all pr-10 bg-white`}
              />
              <div
                className="absolute right-3 top-9 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
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
          </div>
        )}

        {/* Thông tin mentor */}
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-blue-100 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            Thông tin Mentor
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bio">
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
              className={`w-full px-4 py-3 rounded-lg border ${
                formik.touched.bio && formik.errors.bio 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-300 focus:ring-blue-500"
              } focus:border-transparent focus:outline-none focus:ring-2 transition-all bg-white resize-none`}
            />
            {formik.touched.bio && formik.errors.bio && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.bio}</p>
            )}
          </div>
        
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Lĩnh vực chuyên môn</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {specializationOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    id={option}
                    checked={selectedSpecializations.includes(option)}
                    onChange={() => handleSpecializationChange(option)}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor={option} className="text-gray-700 cursor-pointer text-sm">
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
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="experience">
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
              className={`w-full px-4 py-3 rounded-lg border ${
                formik.touched.experience && formik.errors.experience 
                  ? "border-red-500 focus:ring-red-500" 
                  : "border-gray-300 focus:ring-blue-500"
              } focus:border-transparent focus:outline-none focus:ring-2 transition-all bg-white`}
            />
            {formik.touched.experience && formik.errors.experience && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.experience}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thành tựu
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={achievement}
                onChange={(e) => setAchievement(e.target.value)}
                placeholder="Nhập thành tựu của bạn..."
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-transparent focus:outline-none focus:ring-2 transition-all bg-white"
              />
              <button
                type="button"
                onClick={handleAddAchievement}
                className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Thêm
              </button>
            </div>
            
            {achievements.length > 0 && (
              <div className="mt-3 space-y-2">
                {achievements.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <span className="text-gray-700">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {formik.touched.achievements && formik.errors.achievements && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.achievements}</p>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${
              isLoading ? "opacity-70 cursor-not-allowed" : "hover:from-blue-700 hover:to-indigo-700"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </div>
            ) : (
              "Đăng ký làm Giảng viên"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BecomeMentorForm; 