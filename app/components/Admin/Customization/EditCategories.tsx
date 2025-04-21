import {
  useEditLayoutMutation,
  useGetHeroDataQuery,
} from "@/redux/features/layout/layoutApi";
import React, { useEffect, useState } from "react";
import Loader from "../../Loader/Loader";
import { styles } from "@/app/styles/style";
import { AiOutlineDelete } from "react-icons/ai";
import { IoMdAddCircleOutline } from "react-icons/io";
import { FiEdit3 } from "react-icons/fi";
import { HiOutlineSaveAs } from "react-icons/hi";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

type Props = {};

const EditCategories = (props: Props) => {
  const { data, isLoading, refetch } = useGetHeroDataQuery("Categories", {
    refetchOnMountOrArgChange: true,
  });
  const [editLayout, { isSuccess: layoutSuccess, error }] =
    useEditLayoutMutation();
  const [categories, setCategories] = useState<any>([]);
  const [activeEditIndex, setActiveEditIndex] = useState<number | null>(null);

  useEffect(() => {
    if (data) {
      setCategories(data.layout.categories);
    }
    if (layoutSuccess) {
      refetch();
      toast.success("Danh mục đã cập nhật thành công");
    }

    if (error) {
      if ("data" in error) {
        const errorData = error as any;
        toast.error(errorData?.data?.message);
      }
    }
  }, [data, layoutSuccess, error, refetch]);

  const handleCategoriesAdd = (id: any, value: string) => {
    setCategories((prevCategory: any) =>
      prevCategory.map((i: any) => (i._id === id ? { ...i, title: value } : i))
    );
  };

  const newCategoriesHandler = () => {
    if (categories.length > 0 && categories[categories.length - 1].title === "") {
      toast.error("Tiêu đề danh mục không được để trống");
    } else {
      setCategories((prevCategory: any) => [...prevCategory, { title: "" }]);
      setTimeout(() => {
        setActiveEditIndex(categories.length);
        // Focus vào input mới với type checking
        const inputs = document.querySelectorAll('input[type="text"]');
        if (inputs.length > 0) {
          const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
          if (lastInput && lastInput.focus) {
            lastInput.focus();
          }
        }
      }, 100);
    }
  };

  const areCategoriesUnchanged = (
    originalCategories: any[],
    newCategories: any[]
  ) => {
    return JSON.stringify(originalCategories) === JSON.stringify(newCategories);
  };

  const isAnyCategoryTitleEmpty = (categories: any[]) => {
    return categories.some((q) => q.title === "");
  };

  const editCategoriesHandler = async () => {
    if (
      !areCategoriesUnchanged(data.layout.categories, categories) &&
      !isAnyCategoryTitleEmpty(categories)
    ) {
      await editLayout({
        type: "Categories",
        categories,
      });
      setActiveEditIndex(null);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: { duration: 0.2 }
    }
  };

  const handleFocusCategory = (index: number) => {
    setActiveEditIndex(index);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {isLoading ? (
        <Loader />
      ) : (
        <div className="mt-[120px] mx-auto mb-8 w-full max-w-4xl px-4 sm:px-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {/* Header - Fixed */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <FiEdit3 className="mr-2" /> Quản lý danh mục
                </h1>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={newCategoriesHandler}
                >
                  <IoMdAddCircleOutline className="mr-2 text-xl" />
                  Thêm danh mục
                </motion.button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mt-3">
                Quản lý các danh mục được hiển thị trên hệ thống. Các danh mục này sẽ được sử dụng để phân loại khóa học.
              </p>
            </div>

            {/* Scrollable Categories List */}
            <div className="h-[400px] overflow-y-auto p-6 bg-white dark:bg-gray-800">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <AnimatePresence>
                  {categories && categories.map((item: any, index: number) => (
                    <motion.div
                      key={item._id || index}
                      variants={itemVariants}
                      exit="exit"
                      layoutId={`category-${index}`}
                      className={`bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 
                      ${activeEditIndex === index 
                        ? 'shadow-md border-l-4 border-indigo-500 dark:border-indigo-400' 
                        : 'shadow-sm hover:shadow-md'}`}
                    >
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex-grow" onClick={() => handleFocusCategory(index)}>
                          <input
                            type="text"
                            className={`w-full bg-transparent border-b-2 transition-all duration-300 
                            ${activeEditIndex === index 
                              ? 'border-indigo-500 dark:border-indigo-400' 
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'} 
                            text-gray-800 dark:text-gray-100 text-lg px-2 py-1 focus:outline-none focus:border-indigo-500`}
                            value={item.title}
                            onChange={(e) => handleCategoriesAdd(item._id, e.target.value)}
                            placeholder="Nhập tiêu đề danh mục..."
                            onFocus={() => handleFocusCategory(index)}
                          />
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-red-500 hover:text-red-600 ml-2 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          onClick={() => {
                            setCategories((prevCategory: any) =>
                              prevCategory.filter((_: any, i: number) => i !== index)
                            );
                          }}
                        >
                          <AiOutlineDelete size={20} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {categories.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Chưa có danh mục nào được tạo</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg inline-flex items-center transition-all duration-300"
                      onClick={newCategoriesHandler}
                    >
                      <IoMdAddCircleOutline className="mr-2" />
                      Tạo danh mục đầu tiên
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </div>
              
            {/* Footer with Save Button - Fixed */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-lg shadow-md flex items-center space-x-2
                    ${
                      areCategoriesUnchanged(data.layout.categories, categories) ||
                      isAnyCategoryTitleEmpty(categories)
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-pointer hover:shadow-emerald-200 dark:hover:shadow-emerald-900"
                    }
                  `}
                  onClick={
                    areCategoriesUnchanged(data.layout.categories, categories) ||
                    isAnyCategoryTitleEmpty(categories)
                      ? () => null
                      : editCategoriesHandler
                  }
                  disabled={
                    areCategoriesUnchanged(data.layout.categories, categories) ||
                    isAnyCategoryTitleEmpty(categories)
                  }
                >
                  <HiOutlineSaveAs size={20} />
                  <span>Lưu thay đổi</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCategories;
