import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  Label,
  YAxis,
  LabelList,
  Tooltip,
  CartesianGrid,
} from "recharts";
import Loader from "../../Loader/Loader";
import { useGetCoursesAnalyticsQuery } from "@/redux/features/analytics/analyticsApi";
import { styles } from "@/app/styles/style";
import { motion } from "framer-motion";

type Props = {
  isDashboard?: boolean;
};

const CourseAnalytics = ({ isDashboard }: Props) => {
  const { data, isLoading } = useGetCoursesAnalyticsQuery({});
  const [totalCourses, setTotalCourses] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);
  const [animate, setAnimate] = useState(false);

  const analyticsData: any = [];

  useEffect(() => {
    if (data) {
      // Tính tổng khóa học
      let total = 0;
      data.courses.last12Months.forEach((item: any) => {
        total += item.count;
      });
      setTotalCourses(total);

      // Tính tỷ lệ tăng trưởng (so sánh 2 tháng gần nhất)
      const lastTwoMonths = data.courses.last12Months.slice(-2);
      if (lastTwoMonths.length === 2) {
        const currentMonth = lastTwoMonths[1].count;
        const prevMonth = lastTwoMonths[0].count;
        if (prevMonth > 0) {
          const growth = ((currentMonth - prevMonth) / prevMonth) * 100;
          setGrowthRate(growth);
        }
      }

      setAnimate(true);
    }
  }, [data]);

  data &&
    data.courses.last12Months.forEach((item: any) => {
      analyticsData.push({ name: item.month, uv: item.count });
    });

  const minValue = 0;

  // Custom Tooltip for better data display
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-700 dark:text-gray-300">{`${label}`}</p>
          <p className="text-blue-600 dark:text-blue-400 font-semibold">{`Số khóa học: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${
            isDashboard
              ? "h-[100%] dark:bg-[#111C43] bg-white shadow-md rounded-lg overflow-hidden"
              : "min-h-[80vh] bg-white dark:bg-gray-900 p-5 rounded-lg shadow-md"
          }`}
        >
          <div className={`${isDashboard ? "p-4" : "mt-8 p-5"}`}>
            <h1 className={`${styles.title} ${isDashboard && "!text-[20px]"} !text-start flex items-center`}>
              <span className="mr-2">📊</span> Thống kê khóa học
            </h1>
            {!isDashboard && (
              <p className={`${styles.label} mt-2 mb-6 text-gray-600 dark:text-gray-400`}>
                Dữ liệu thống kê 12 tháng qua
              </p>
            )}

            {!isDashboard && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white shadow-lg"
                >
                  <h3 className="text-lg font-semibold mb-1 opacity-90">Tổng khóa học</h3>
                  <div className="text-3xl font-bold">{totalCourses}</div>
                  <p className="text-sm mt-3 opacity-80">Tổng số khóa học đã tạo trong 12 tháng qua</p>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-4 text-white shadow-lg"
                >
                  <h3 className="text-lg font-semibold mb-1 opacity-90">Tăng trưởng</h3>
                  <div className="text-3xl font-bold flex items-center">
                    {growthRate.toFixed(1)}%
                    {growthRate > 0 ? (
                      <span className="ml-2 text-emerald-200">↑</span>
                    ) : (
                      <span className="ml-2 text-red-300">↓</span>
                    )}
                  </div>
                  <p className="text-sm mt-3 opacity-80">So với tháng trước</p>
                </motion.div>

                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg p-4 text-white shadow-lg"
                >
                  <h3 className="text-lg font-semibold mb-1 opacity-90">Trung bình hàng tháng</h3>
                  <div className="text-3xl font-bold">
                    {(totalCourses / (analyticsData.length || 1)).toFixed(1)}
                  </div>
                  <p className="text-sm mt-3 opacity-80">Khóa học mới mỗi tháng</p>
                </motion.div>
              </div>
            )}
          </div>

          <div className={`w-full ${!isDashboard ? "h-[60vh]" : "h-full"} flex items-center justify-center px-2`}>
            <ResponsiveContainer width="100%" height={isDashboard ? "80%" : "80%"}>
              <BarChart 
                data={analyticsData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" opacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#555', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#E0E0E0' }}
                >
                  <Label offset={-5} position="insideBottom" />
                </XAxis>
                <YAxis 
                  domain={[minValue, 'auto']} 
                  tick={{ fill: '#555', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#E0E0E0' }}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <Bar 
                  dataKey="uv" 
                  fill="url(#colorUv)" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                  barSize={isDashboard ? 20 : 40}
                >
                  <LabelList 
                    dataKey="uv" 
                    position="top" 
                    fill="#4F46E5" 
                    fontSize={12} 
                    fontWeight="bold"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default CourseAnalytics;
