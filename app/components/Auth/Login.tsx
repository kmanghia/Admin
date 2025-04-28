"use client";
import React, { FC, useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FiMail, FiLock } from "react-icons/fi";
import { styles } from "../../../app/styles/style";
import { useLoginMutation } from "@/redux/features/auth/authApi";
import { toast } from "react-hot-toast";
import { redirect } from "next/navigation";
import Link from "next/link";

// CSS cho background animation
const backgroundStyles = `
  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes floatingShapes {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(10deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 0.4; }
    100% { transform: scale(1); opacity: 0.8; }
  }
  
  .animate-blob {
    animation: pulse 10s infinite alternate;
  }
  
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  
  .floating-shape {
    animation: floatingShapes 8s ease-in-out infinite;
  }
  
  .floating-shape-2 {
    animation: floatingShapes 9s ease-in-out infinite 1s;
  }
  
  .floating-shape-3 {
    animation: floatingShapes 10s ease-in-out infinite 2s;
  }
  
  .animated-gradient {
    background: linear-gradient(270deg, #0ea5e9, #6366f1, #8b5cf6, #ec4899);
    background-size: 400% 400%;
    animation: gradientAnimation 15s ease infinite;
  }
`;

type Props = {
    setRoute: (route: string) => void;
    setOpen?: (open: boolean) => void;
    refetch?: any;
  };
  
  const schema = Yup.object().shape({
    email: Yup.string()
      .email("Email không hợp lệ!")
      .required("Vui lòng nhập email của bạn!"),
    password: Yup.string().required("Vui lòng nhập password của bạn!").min(6),
  });
  
  const Login: FC<Props> = ({ setRoute, setOpen, refetch }) => {
    const [show, setShow] = useState(false);
    const [login, { isSuccess, error }] = useLoginMutation();
    const formik = useFormik({
      initialValues: { email: "", password: "" },
      validationSchema: schema,
      onSubmit: async ({ email, password }) => {
        await login({ email, password });
      },
    });
  
    useEffect(() => {
      if (isSuccess) {
        toast.success("Đăng nhập thành công!");
        redirect("/admin");
      }
      if (error) {
        if ("data" in error) {
          const errorData = error as any;
          toast.error(errorData.data.message);
        }
      }
    }, [isSuccess, error]);
  
    const { errors, touched, values, handleChange, handleSubmit } = formik;
  
    return (
      <>
        <style jsx>{backgroundStyles}</style>
        <div className="fixed inset-0 animated-gradient -z-10"></div>
        
        {/* Decorative Shapes */}
        <div className="fixed -z-5 inset-0 overflow-hidden">
          {/* Large Circles */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full opacity-10 floating-shape"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-white rounded-full opacity-10 floating-shape-2"></div>
          
          {/* Geometric Shapes */}
          <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white opacity-10 rounded-lg rotate-45 floating-shape-3"></div>
          <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-white opacity-10 rounded-lg floating-shape"></div>
          
          {/* Small Dots */}
          <div className="absolute top-10 right-10 w-4 h-4 bg-white rounded-full opacity-20"></div>
          <div className="absolute top-1/2 left-10 w-6 h-6 bg-white rounded-full opacity-20"></div>
          <div className="absolute bottom-10 right-1/4 w-5 h-5 bg-white rounded-full opacity-20"></div>
        </div>
        
        <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
          <div className="relative w-full max-w-md mx-auto overflow-hidden">
            <div className="relative p-8 bg-white/80 backdrop-blur-xl rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/95 to-white/90 opacity-90 z-[-1] rounded-xl"></div>
              
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-6 relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Đăng Nhập</span>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
              </h1>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-gray-700 font-semibold block" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-blue-500" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      id="email"
                      placeholder="example@gmail.com"
                      className={`w-full pl-10 pr-3 py-3 border ${
                        errors.email && touched.email ? "border-red-500" : "border-blue-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200`}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <span className="text-red-500 text-sm">{errors.email}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700 font-semibold block" htmlFor="password">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-blue-500" />
                    </div>
                    <input
                      type={!show ? "password" : "text"}
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      id="password"
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-3 border ${
                        errors.password && touched.password ? "border-red-500" : "border-blue-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all duration-200`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {!show ? (
                        <AiOutlineEyeInvisible
                          className="text-gray-500 cursor-pointer hover:text-blue-600 transition-all"
                          size={20}
                          onClick={() => setShow(true)}
                        />
                      ) : (
                        <AiOutlineEye
                          className="text-gray-500 cursor-pointer hover:text-blue-600 transition-all"
                          size={20}
                          onClick={() => setShow(false)}
                        />
                      )}
                    </div>
                  </div>
                  {errors.password && touched.password && (
                    <span className="text-red-500 text-sm">{errors.password}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
                >
                  Đăng nhập
                </button>
              </form>

              <div className="mt-6 flex justify-between items-center text-sm">
                <button
                  className="text-blue-600 hover:text-blue-800 font-medium transition-all duration-200"
                  onClick={() => setRoute("Forgot-Password")}
                >
                  Quên mật khẩu?
                </button>
              </div>

              <div className="relative mt-8 pt-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">hoặc</span>
                </div>
              </div>

              <div className="mt-6">
                <Link 
                  href="/become-mentor"
                  className="block w-full text-center py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => {
                    if (setOpen) setOpen(false);
                  }}
                >
                  Đăng ký trở thành Giảng viên
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };
  
  export default Login;