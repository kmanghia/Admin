import { styles } from "@/app/styles/style";
import {
  useEditLayoutMutation,
  useGetHeroDataQuery,
} from "@/redux/features/layout/layoutApi";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineDelete } from "react-icons/ai";
import { HiMinus, HiPlus } from "react-icons/hi";
import { IoMdAddCircleOutline } from "react-icons/io";
import { FiEdit3, FiHelpCircle } from "react-icons/fi";
import { HiOutlineSaveAs } from "react-icons/hi";
import Loader from "../../Loader/Loader";
import { motion, AnimatePresence } from "framer-motion";

type Props = {};

const EditFaq = (props: Props) => {
  const { data, isLoading, refetch } = useGetHeroDataQuery("FAQ", {
    refetchOnMountOrArgChange: true,
  });
  const [editLayout, { isSuccess: layoutSuccess, error }] = useEditLayoutMutation();

  const [questions, setQuestions] = useState<any[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setQuestions(data.layout.faq.map((q: any) => ({
        ...q,
        active: false
      })));
    }
    if (layoutSuccess) {
      refetch();
      toast.success("FAQ cập nhật thành công");
    }

    if (error) {
        if ("data" in error) {
            const errorData = error as any;
            toast.error(errorData?.data?.message);
          }
    }
  }, [data, layoutSuccess, error, refetch]);

  const toggleQuestion = (id: any) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q._id === id ? { ...q, active: !q.active } : q))
    );
  };

  const handleQuestionChange = (id: any, value: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q._id === id ? { ...q, question: value } : q))
    );
  };

  const handleAnswerChange = (id: any, value: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q._id === id ? { ...q, answer: value } : q))
    );
  };

  const newFaqHandler = () => {
    const newQuestion = {
      _id: Date.now().toString(), // Temporary ID
        question: "",
        answer: "",
      active: true,
    };
    
    setQuestions([...questions, newQuestion]);
    setExpandedQuestion(newQuestion._id);
    
    // Scroll to bottom after DOM updates
    setTimeout(() => {
      const container = document.getElementById('faq-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
      
      // Focus the new question input
      const inputs = document.querySelectorAll('input[type="text"]');
      if (inputs.length > 0) {
        const lastInput = inputs[inputs.length - 2] as HTMLInputElement; // -2 because we want the question, not answer
        if (lastInput && lastInput.focus) {
          lastInput.focus();
        }
      }
    }, 100);
  };

  // Function to check if the FAQ arrays are unchanged
  const areQuestionsUnchanged = (
    originalQuestions: any[],
    newQuestions: any[]
  ) => {
    // Create copies without the active flag for comparison
    const original = originalQuestions.map(({ active, ...rest }) => rest);
    const newOnes = newQuestions.map(({ active, ...rest }) => rest);
    
    return JSON.stringify(original) === JSON.stringify(newOnes);
  };

  const isAnyQuestionEmpty = (questions: any[]) => {
    return questions.some((q) => q.question === "" || q.answer === "");
  };

  const handleEdit = async () => {
    if (
      !areQuestionsUnchanged(data.layout.faq, questions) &&
      !isAnyQuestionEmpty(questions)
    ) {
      // Remove active flag from questions before saving
      const questionsToSave = questions.map(({ active, ...rest }) => rest);
      
      await editLayout({
        type: "FAQ",
        faq: questionsToSave,
      });
    }
  };

  const removeQuestion = (id: any) => {
    setQuestions((prevQuestions) => 
      prevQuestions.filter((item) => item._id !== id)
    );
    
    if (expandedQuestion === id) {
      setExpandedQuestion(null);
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
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {isLoading ? (
        <Loader />
    ) : (
        <div className="mt-[120px] mx-auto mb-8 w-full max-w-4xl px-4 sm:px-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <FiHelpCircle className="mr-2" /> Quản lý FAQ
                </h1>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={newFaqHandler}
                >
                  <IoMdAddCircleOutline className="mr-2 text-xl" />
                  Thêm câu hỏi
                </motion.button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mt-3">
                Quản lý các câu hỏi thường gặp hiển thị trên trang web. Nhấp vào câu hỏi để chỉnh sửa và mở rộng câu trả lời.
              </p>
            </div>

            {/* FAQ List - Scrollable */}
            <div id="faq-container" className="h-[400px] overflow-y-auto p-6 bg-white dark:bg-gray-800">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <AnimatePresence>
                  {questions.map((q: any, index) => (
                    <motion.div
                key={q._id}
                      variants={itemVariants}
                      exit="exit"
                      layoutId={`faq-${q._id}`}
                      className={`bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden transition-all duration-300
                        ${q.active ? 'shadow-md border-l-4 border-indigo-500 dark:border-indigo-400' : 'hover:shadow'}
                      `}
              >
                      <div className="p-4">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleQuestion(q._id)}
                  >
                          <div className="flex-grow pr-4">
                    <input
                              type="text"
                              className={`w-full bg-transparent border-b-2 transition-colors duration-300
                                ${q.active 
                                  ? 'border-indigo-500 dark:border-indigo-400' 
                                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                                }
                                text-gray-800 dark:text-gray-100 text-lg px-2 py-1 focus:outline-none focus:border-indigo-500
                              `}
                      value={q.question}
                              onChange={(e) => handleQuestionChange(q._id, e.target.value)}
                              placeholder="Nhập câu hỏi..."
                              onClick={(e) => e.stopPropagation()}
                    />
                          </div>
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`rounded-full p-1 transition-colors
                                ${q.active 
                                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                                  : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                }
                              `}
                            >
                      {q.active ? (
                                <HiMinus className="h-5 w-5" />
                      ) : (
                                <HiPlus className="h-5 w-5" />
                      )}
                            </motion.button>
                          </div>
                        </div>

                        <AnimatePresence>
                {q.active && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 relative"
                            >
                              <textarea
                                className="w-full bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg p-3 min-h-[100px] text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                      value={q.answer}
                                onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                placeholder="Nhập câu trả lời..."
                    />
                              <motion.button
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-600 bg-white dark:bg-gray-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeQuestion(q._id);
                                }}
                                title="Xóa câu hỏi"
                              >
                                <AiOutlineDelete size={18} />
                              </motion.button>
                            </motion.div>
                )}
                        </AnimatePresence>
              </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {questions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Chưa có câu hỏi nào được tạo</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg inline-flex items-center transition-all duration-300"
            onClick={newFaqHandler}
                    >
                      <IoMdAddCircleOutline className="mr-2" />
                      Tạo câu hỏi đầu tiên
                    </motion.button>
                  </div>
                )}
              </motion.div>
        </div>
  
            {/* Footer with Save Button */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-lg shadow-md flex items-center space-x-2
              ${
                areQuestionsUnchanged(data.layout.faq, questions) ||
                isAnyQuestionEmpty(questions)
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 text-white cursor-pointer hover:shadow-emerald-200 dark:hover:shadow-emerald-900"
              }
                  `}
          onClick={
            areQuestionsUnchanged(data.layout.faq, questions) ||
            isAnyQuestionEmpty(questions)
              ? () => null
              : handleEdit
          }
                  disabled={
                    areQuestionsUnchanged(data.layout.faq, questions) ||
                    isAnyQuestionEmpty(questions)
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

export default EditFaq;