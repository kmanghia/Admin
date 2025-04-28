import { styles } from "@/app/styles/style";
import React, { FC, useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineDelete, AiOutlinePlusCircle } from "react-icons/ai";
import { BsLink45Deg, BsPencil, BsPlusCircle } from "react-icons/bs";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

type Props = {
  active: number;
  setActive: (active: number) => void;
  courseContentData: any;
  setCourseContentData: (courseContentData: any) => void;
  handleSubmit: any;
  setVideo: (video: any) => void;
};

const CourseContent: FC<Props> = ({
  courseContentData,
  setCourseContentData,
  active,
  setActive,
  handleSubmit: handlleCourseSubmit,
  setVideo
}) => {
  const [isCollapsed, setIsCollapsed] = useState(
    Array(courseContentData.length).fill(false)
  );
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [videoPreviewUrls, setVideoPreviewUrls] = useState<string[]>(Array(courseContentData.length).fill(''));
  const [activeSection, setActiveSection] = useState(1);

  // Khởi tạo videoPreviewUrls từ courseContentData khi chỉnh sửa khóa học
  useEffect(() => {
    if (courseContentData && courseContentData.length > 0) {
      const newVideoPreviewUrls = [...videoPreviewUrls];
      
      courseContentData.forEach((item: any, index: number) => {
        if (item.videoUrl && !newVideoPreviewUrls[index]) {
          // Nếu videoUrl đã có sẵn nhưng chưa có preview URL
          if (typeof item.videoUrl === 'string') {
            let videoUrl;
            if (item.videoUrl.startsWith('http')) {
              videoUrl = item.videoUrl;
            } else {
              videoUrl = `http://localhost:8000/videos/${item.videoUrl}`;
            }
            newVideoPreviewUrls[index] = videoUrl;
          }
        }
      });
      
      if (newVideoPreviewUrls.some(url => url !== '')) {
        setVideoPreviewUrls(newVideoPreviewUrls);
      }
    }
  }, [courseContentData]);

  // Khởi tạo preview cho hình ảnh câu hỏi khi chỉnh sửa khóa học
  const initialImagePreviewDone = useRef(false);
  useEffect(() => {
    // Only run this once on first load
    if (initialImagePreviewDone.current) return;
    
    if (courseContentData && courseContentData.length > 0) {
      let hasUpdates = false;
      const updatedContentData = courseContentData.map((content: { iquizz: any[]; }, contentIndex: any) => {
        // Kiểm tra nếu có iquizz và là mảng
        if (content.iquizz && Array.isArray(content.iquizz)) {
          // Tạo mảng mới cho các câu hỏi quiz
          const updatedIquizz = content.iquizz.map((quizz, quizzIndex) => {
            // Kiểm tra nếu có questionImage nhưng chưa có preview
            if (quizz.questionImage && quizz.questionImage.url && !quizz.questionImage.preview) {
              hasUpdates = true;
              
              // Tạo URL từ đường dẫn ảnh
              let imageUrl;
              if (quizz.questionImage.url.startsWith('http')) {
                imageUrl = quizz.questionImage.url;
              } else {
                imageUrl = `http://localhost:8000/images/${quizz.questionImage.url}`;
              }
              
              console.log(`[DEBUG-PREVIEW] Added preview for question image: section=${contentIndex}, quiz=${quizzIndex}, url=${imageUrl}`);
              
              // Trả về câu hỏi quiz với thông tin ảnh mới
              return {
                ...quizz,
                questionImage: {
                  ...quizz.questionImage,
                  preview: imageUrl
                }
              };
            }
            // Trả về câu hỏi quiz không đổi
            return quizz;
          });
          
          // Trả về nội dung đã cập nhật
          return {
            ...content,
            iquizz: updatedIquizz
          };
        }
        // Trả về nội dung không đổi
        return content;
      });
      
      if (hasUpdates) {
        initialImagePreviewDone.current = true;
        setCourseContentData(updatedContentData);
      } else {
        initialImagePreviewDone.current = true;
      }
    }
  }, [courseContentData]);

  // Cleanup video preview URLs when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup video preview URLs
      videoPreviewUrls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      
      // Cleanup question image preview URLs
      courseContentData.forEach((content: { iquizz: any[]; }) => {
        if (content.iquizz && Array.isArray(content.iquizz)) {
          content.iquizz.forEach((quizz: { questionImage: { preview: string; }; }) => {
            if (quizz.questionImage?.preview && quizz.questionImage.preview.startsWith('blob:')) {
              URL.revokeObjectURL(quizz.questionImage.preview);
            }
          });
        }
      });
    };
  }, [videoPreviewUrls, courseContentData]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  const handleCollapseToggle = (index: number) => {
    const updatedCollasped = [...isCollapsed];
    updatedCollasped[index] = !updatedCollasped[index];
    setIsCollapsed(updatedCollasped);
  };

  const handleRemoveLink = (index: number, linkIndex: number) => {
    const updatedData = [...courseContentData];
    updatedData[index] = {
      ...updatedData[index],
      links: updatedData[index].links.filter((_: any, i: number) => i !== linkIndex),
    };
    setCourseContentData(updatedData);
  };

  const handleAddLink = (index: number) => {
    const updatedData = [...courseContentData];
    updatedData[index] = {
      ...updatedData[index],
      links: [...updatedData[index].links, { title: "", url: "" }],
    };
    setCourseContentData(updatedData);
  };

  const handleRemoveQuizz = (index: number, quizzIndex: number) => {
    const updatedData = [...courseContentData];
    updatedData[index] = {
      ...updatedData[index],
      iquizz: updatedData[index].iquizz.filter((_: any, i: number) => i !== quizzIndex),
    };
    setCourseContentData(updatedData);
  };
  
  const handleAddQuizz = (index: number) => {
    const updatedData = [...courseContentData];
    updatedData[index] = {
      ...updatedData[index],
      iquizz: [...updatedData[index].iquizz, { 
        question: "", 
        options: ["", "", "", ""], 
        correctAnswer: "",
        questionImage: undefined 
      }],
    };
    setCourseContentData(updatedData);
  };
  
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files.length > 0) {
      // Tạo bản sao của mảng selectedVideos
      const files = [...selectedVideos];
      
      // Thêm file mới vào vị trí tương ứng
      files[index] = e.target.files[0];
      
      // Tạo bản sao của courseContentData
      const updatedData = [...courseContentData];
      
      // Cập nhật videoUrl cho phần tử tại vị trí index
      updatedData[index] = {
        ...updatedData[index],
        videoUrl: courseContentData[index]._id,
      };

      console.log(updatedData[index].videoUrl);

      // Tạo URL xem trước video
      const newVideoPreviewUrls = [...videoPreviewUrls];
      if (newVideoPreviewUrls[index] && newVideoPreviewUrls[index].startsWith('blob:')) {
        URL.revokeObjectURL(newVideoPreviewUrls[index]);
      }
      newVideoPreviewUrls[index] = URL.createObjectURL(e.target.files[0]);
      setVideoPreviewUrls(newVideoPreviewUrls);
      
      // Log ra toàn bộ mảng files để kiểm tra
      console.log('All selected videos:', files);
      
      // Cập nhật state
      setCourseContentData(updatedData);
      console.log("updated data:"+ updatedData);
      setSelectedVideos(files);  // Thay vì setVideo
      console.log(index);
      console.log(files);
      setVideo(files);
    }
  };

  const newContentHandler = (item: any) => {
    if (
      item.title === "" ||
      item.description === "" ||
      item.videoUrl === "" ||
      item.links[0].title === "" ||
      item.links[0].url === "" ||
      item.videoLength === ""
    ) {
      toast.error("Vui lòng điền vào tất cả các trường trước!");
    } else {
      let newVideoSection = "";

      if (courseContentData.length > 0) {
        const lastVideoSection =
          courseContentData[courseContentData.length - 1].videoSection;

        if (lastVideoSection) {
          newVideoSection = lastVideoSection;
        }
      }
      const newContent = {
        videoUrl: "",
        title: "",
        description: "",
        videoSection: newVideoSection,
        videoLength: "",
        links: [{ title: "", url: "" }],
        iquizz: [{ question: "", options: ["", "", "", ""], correctAnswer: "", questionImage: undefined }]
      };

      setCourseContentData([...courseContentData, newContent]);
      // Thêm một phần tử trống vào mảng videoPreviewUrls
      setVideoPreviewUrls([...videoPreviewUrls, '']);
    }
  };

  const addNewSection = () => {
    if (
      courseContentData[courseContentData.length - 1].title === "" ||
      courseContentData[courseContentData.length - 1].description === "" ||
      courseContentData[courseContentData.length - 1].videoUrl === "" ||
      courseContentData[courseContentData.length - 1].links[0].title === "" ||
      courseContentData[courseContentData.length - 1].links[0].url === ""
    ) {
      toast.error("Vui lòng điền vào tất cả các trường trước!");
    } else {
      setActiveSection(activeSection + 1);
      const newContent = {
        videoUrl: "",
        title: "",
        description: "",
        videoLength: "",
        videoSection: `Phần không có tiêu đề ${activeSection}`,
        links: [{ title: "", url: "" }],
        iquizz: [{ question: "", options: ["", "", "", ""], correctAnswer: "", questionImage: undefined }]
      };
      setCourseContentData([...courseContentData, newContent]);
      // Thêm một phần tử trống vào mảng videoPreviewUrls
      setVideoPreviewUrls([...videoPreviewUrls, '']);
    }
  };

  const prevButton = () => {
    setActive(active - 1);
  };

  const handleOptions = () => {
    if (
      courseContentData[courseContentData.length - 1].title === "" ||
      courseContentData[courseContentData.length - 1].description === "" ||
      courseContentData[courseContentData.length - 1].videoUrl === "" ||
      courseContentData[courseContentData.length - 1].links[0].title === "" ||
      courseContentData[courseContentData.length - 1].links[0].url === ""
    ) {
      toast.error("phần không được để trống!");
    } else {
      setActive(active + 1);
      handlleCourseSubmit();
    }
  };

  return (
    <div className="w-[80%] ml-[30px] m-auto mt-24 p-3">
      <form onSubmit={handleSubmit}>
        {courseContentData?.map((item: any, index: number) => {
          const showSectionInput =
            index === 0 ||
            item.videoSection !== courseContentData[index - 1].videoSection;

          return (
            <div
              className={`w-full bg-[#cdc8c817] p-4 ${
                showSectionInput ? "mt-10" : "mb-0"
              }`}
              key={index}
            >
              {showSectionInput && (
                <div className="flex w-full items-center">
                  <input
                    type="text"
                    className={`text-[20px] ${
                      item.videoSection === "Untitled Section"
                        ? "w-[170px]"
                        : "w-min"
                    } font-Poppins cursor-pointer dark:text-white text-black bg-transparent outline-none`}
                    value={item.videoSection}
                    onChange={(e) => {
                      const updatedData = [...courseContentData];
                      updatedData[index] = {
                        ...updatedData[index],
                        videoSection: e.target.value,
                      };
                      setCourseContentData(updatedData);
                    }}
                  />
                  <BsPencil className="cursor-pointer dark:text-white text-black" />
                </div>
              )}

              <div className="flex w-full items-center justify-between my-0">
                {isCollapsed[index] ? (
                  item.title ? (
                    <p className="font-Poppins dark:text-white text-black">
                      {index + 1}. {item.title}
                    </p>
                  ) : null
                ) : null}

                <div className="flex items-center">
                  <AiOutlineDelete
                    className={`dark:text-white text-[20px] mr-2 text-black ${
                      index > 0 ? "cursor-pointer" : "cursor-no-drop"
                    }`}
                    onClick={() => {
                      if (index > 0) {
                        const updatedData = [...courseContentData];
                        updatedData.splice(index, 1);
                        setCourseContentData(updatedData);
                        
                        // Cập nhật lại mảng videoPreviewUrls
                        const newVideoPreviewUrls = [...videoPreviewUrls];
                        if (newVideoPreviewUrls[index] && newVideoPreviewUrls[index].startsWith('blob:')) {
                          URL.revokeObjectURL(newVideoPreviewUrls[index]);
                        }
                        newVideoPreviewUrls.splice(index, 1);
                        setVideoPreviewUrls(newVideoPreviewUrls);
                      }
                    }}
                  />
                  <MdOutlineKeyboardArrowDown
                    fontSize="large"
                    className="dark:text-white text-black"
                    style={{
                      transform: isCollapsed[index]
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                    onClick={() => handleCollapseToggle(index)}
                  />
                </div>
              </div>

              {!isCollapsed[index] && (
                <>
                  <div className="my-3">
                    <label className={styles.label}>Tiêu đề video</label>
                    <input
                      type="text"
                      placeholder="kế hoạch dự án..."
                      className={`${styles.input}`}
                      value={item.title}
                      onChange={(e) => {
                        const updatedData = [...courseContentData];
                        updatedData[index] = {
                          ...updatedData[index],
                          title: e.target.value,
                        };
                        console.log(index)
                        setCourseContentData(updatedData);
                      }}
                    />
                  </div>
                  <div className="mb-3">
                    <label className={styles.label}>video</label>
                    <input
                      type="file"
                      accept="video/*"
                      placeholder="sdder"
                      className={`${styles.input}`}
                      onChange={(e) => handleVideoChange(e, index)}
                    />
                    {videoPreviewUrls[index] && (
                      <div className="mt-2">
                        <video 
                          controls 
                          className="w-full h-auto mt-2" 
                          src={videoPreviewUrls[index]}
                        >
                          Trình duyệt của bạn không hỗ trợ thẻ video.
                        </video>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className={styles.label}>Độ dài video (phút)</label>
                    <input
                      type="number"
                      placeholder="20"
                      className={`${styles.input}`}
                      value={item.videoLength}
                      onChange={(e) => {
                        const updatedData = [...courseContentData];
                        updatedData[index] = {
                          ...updatedData[index],
                          videoLength: e.target.value,
                        };
                        setCourseContentData(updatedData);
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className={styles.label}>Mô tả video</label>
                    <textarea
                      rows={8}
                      cols={30}
                      placeholder="sdder"
                      className={`${styles.input} !h-min py-2`}
                      value={item.description}
                      onChange={(e) => {
                        const updatedData = [...courseContentData];
                        updatedData[index] = {
                          ...updatedData[index],
                          description: e.target.value,
                        };
                        setCourseContentData(updatedData);
                      }}
                    />
                  </div>
                  {item?.links.map((link: any, linkIndex: number) => (
                    <div className="mb-3 block" key={linkIndex}>
                      <div className="w-full flex items-center justify-between">
                        <label className={styles.label}>
                          Link {linkIndex + 1}
                        </label>
                        <AiOutlineDelete
                          className={`${
                            linkIndex === 0
                              ? "cursor-no-drop"
                              : "cursor-pointer"
                          } text-black dark:text-white text-[20px]`}
                          onClick={() =>
                            linkIndex === 0
                              ? null
                              : handleRemoveLink(index, linkIndex)
                          }
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Mã nguồn... (Tiêu đề liên kết)"
                        className={`${styles.input}`}
                        value={link.title}
                        onChange={(e) => {
                          const updatedData = [...courseContentData];
                          updatedData[index] = {
                            ...updatedData[index],
                            links: updatedData[index].links.map((l: any, i: number) =>
                              i === linkIndex
                                ? { ...l, title: e.target.value }
                                : l
                            ),
                          };
                          setCourseContentData(updatedData);
                        }}
                      />
                      <input
                        type="url"
                        placeholder="Đường dẫn mã nguồn... (đường dẫn liên kết)"
                        className={`${styles.input} mt-6`}
                        value={link.url}
                        onChange={(e) => {
                          const updatedData = [...courseContentData];
                          updatedData[index] = {
                            ...updatedData[index],
                            links: updatedData[index].links.map((l: any, i: number) =>
                              i === linkIndex
                                ? { ...l, url: e.target.value }
                                : l
                            ),
                          };
                          setCourseContentData(updatedData);
                        }}
                      />
                    </div>
                  ))}
                  <div className="inline-block mb-4">
                    <p
                      className="flex items-center text-[18px] dark:text-white text-black cursor-pointer"
                      onClick={() => handleAddLink(index)}
                    >
                      <BsLink45Deg className="mr-2" /> Thêm liên kết
                    </p>
                  </div>


                  {item?.iquizz.map((quizz: any, quizzIndex: number) => (
  <div className="mb-3 block" key={quizzIndex}>
    <div className="w-full flex items-center justify-between">
      <label className={styles.label}>
        Question {quizzIndex + 1}
      </label>
      <AiOutlineDelete
        className={`${
          quizzIndex === 0 ? "cursor-no-drop" : "cursor-pointer"
        } text-black dark:text-white text-[20px]`}
        onClick={() => quizzIndex === 0 ? null : handleRemoveQuizz(index, quizzIndex)}
      />
    </div>
    <input
      type="text"
      placeholder="Câu hỏi..."
      className={`${styles.input}`}
      value={quizz.question}
      onChange={(e) => {
        const updatedData = [...courseContentData];
        updatedData[index] = {
          ...updatedData[index],
          iquizz: updatedData[index].iquizz.map((q: any, i: number) =>
            i === quizzIndex ? { ...q, question: e.target.value } : q
          ),
        };
        setCourseContentData(updatedData);
      }}
    />
    
    {/* Question Image Upload */}
    <div className="mt-2 mb-4">
      <label className={`${styles.label} block mb-2`}>Hình ảnh cho câu hỏi (không bắt buộc)</label>
      <input
        type="file"
        accept="image/*"
        className={`${styles.input}`}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            console.log(`[DEBUG-UPLOAD] Đã chọn file: ${file.name}, size: ${file.size}, type: ${file.type}`);
            
            // Tạo URL tạm thời để hiển thị ảnh preview
            const imageUrl = URL.createObjectURL(file);
            console.log(`[DEBUG-UPLOAD] Đã tạo URL preview: ${imageUrl}`);
            
            // Tạo bản sao của dữ liệu (không sử dụng JSON.parse/stringify cho File object)
            const updatedData = courseContentData.map((content: { iquizz: any[]; }, contentIndex: number) => {
              if (contentIndex === index) {
                // Sao chép nội dung hiện tại
                return {
                  ...content,
                  iquizz: content.iquizz.map((quiz: any, qIndex: number) => {
                    if (qIndex === quizzIndex) {
                      // Cập nhật quiz hiện tại với hình ảnh mới
                      return {
                        ...quiz,
                        questionImage: {
                          url: file.name,
                          file: file,
                          preview: imageUrl,
                          contentIndex: index,
                          quizzIndex: quizzIndex
                        }
                      };
                    }
                    return quiz;
                  })
                };
              }
              return content;
            });
            
            console.log(`[DEBUG-UPLOAD] Đã cập nhật state với file hình ảnh cho câu hỏi: section=${index}, quiz=${quizzIndex}`);
            
            // Kiểm tra lại đối tượng File
            const updatedQuizz = updatedData[index].iquizz[quizzIndex];
            if (updatedQuizz.questionImage?.file) {
              console.log(`[DEBUG-UPLOAD] File object after state update:`, {
                name: updatedQuizz.questionImage.file.name,
                size: updatedQuizz.questionImage.file.size,
                type: updatedQuizz.questionImage.file.type
              });
            }
            
            setCourseContentData(updatedData);
          }
        }}
      />
      
      {/* Image Preview */}
      {quizz.questionImage?.preview && (
        <div className="mt-2">
          <img 
            src={quizz.questionImage.preview} 
            alt="Question Preview" 
            className="max-w-[200px] h-auto rounded-md border" 
          />
        </div>
      )}
    </div>
    
    {quizz.options.map((option: string, optionIndex: number) => (
      <input
        key={optionIndex}
        type="text"
        placeholder={`Lựa chọn ${optionIndex + 1}...`}
        className={`${styles.input} mt-2`}
        value={option}
        onChange={(e) => {
          const updatedData = [...courseContentData];
          updatedData[index] = {
            ...updatedData[index],
            iquizz: updatedData[index].iquizz.map((q: any, i: number) => {
              if (i === quizzIndex) {
                const updatedOptions = [...q.options];
                updatedOptions[optionIndex] = e.target.value;
                return { ...q, options: updatedOptions };
              }
              return q;
            }),
          };
          setCourseContentData(updatedData);
        }}
      />
    ))}
    <input
      type="text"
      placeholder="Đáp án đúng..."
      className={`${styles.input} mt-6`}
      value={quizz.correctAnswer}
      onChange={(e) => {
        const updatedData = [...courseContentData];
        updatedData[index] = {
          ...updatedData[index],
          iquizz: updatedData[index].iquizz.map((q: any, i: number) =>
            i === quizzIndex ? { ...q, correctAnswer: e.target.value } : q
          ),
        };
        setCourseContentData(updatedData);
      }}
    />
  </div>
))}
<div className="inline-block mb-4">
  <p
    className="flex items-center text-[18px] dark:text-white text-black cursor-pointer"
    onClick={() => handleAddQuizz(index)}
  >
    <BsLink45Deg className="mr-2" /> Thêm câu hỏi
  </p>
</div>

                </>
              )}

              {index === courseContentData.length - 1 && (
                <div>
                  <p
                    className="flex items-center text-[18px] dark:text-white text-black cursor-pointer"
                    onClick={() => newContentHandler(item)}
                  >
                    <AiOutlinePlusCircle className="mr-2" /> Thêm nội dung mới
                  </p>
                </div>
              )}
            </div>
          );
        })}
        <br />
        <div
          className="flex items-center text-[20px] dark:text-white text-black cursor-pointer"
          onClick={() => addNewSection()}
        >
          <AiOutlinePlusCircle className="mr-2" /> Thêm phần mới
        </div>
      </form>
      <br />
      <div className="w-full flex items-center justify-between">
        <div
          className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer"
          onClick={() => prevButton()}
        >
          Trước
        </div>
        <div
          className="w-full 800px:w-[180px] flex items-center justify-center h-[40px] bg-[#37a39a] text-center text-[#fff] rounded mt-8 cursor-pointer"
          onClick={() => handleOptions()}
        >
          Sau
        </div>
      </div>
      <br />
      <br />
      <br />
    </div>
  );
};

export default CourseContent;
