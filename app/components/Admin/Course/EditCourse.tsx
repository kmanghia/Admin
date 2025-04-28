"use client";
import React, { FC, useEffect, useState } from "react";
import CourseInformation from "./CourseInformation";
import CourseOptions from "./CourseOptions";
import CourseData from "./CourseData";
import CourseContent from "./CourseContent";
import CoursePreview from "./CoursePreview";
import {
  useEditCourseMutation,
  useGetAllCoursesQuery,
} from "../../../../redux/features/courses/coursesApi";
import { toast } from "react-hot-toast";
import { redirect } from "next/navigation";

// Định nghĩa interface cho QuizQuestion
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  questionImage?: {
    url: string;
    file?: File;
    preview?: string;
    uniqueId?: string;
  };
}

type Props = {
  id: string;
  userRole?: string;
};

const EditCourse: FC<Props> = ({ id, userRole = "admin" }) => {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState<File[] | null>(null);
  const [demo, setDemo] = useState(null);
  const [demopreviewUrl, setDemoPreviewUrl] = useState<string>('');
  const [editCourse, { isSuccess, error }] = useEditCourseMutation();
  const { data, refetch } = useGetAllCoursesQuery(
    {},
    { refetchOnMountOrArgChange: true }
  );

  const editCourseData = data && data.courses.find((i: any) => i._id === id);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Khóa học đã được cập nhật thành công");
      if (userRole === "mentor") {
        redirect("/mentor/courses");
      } else {
        redirect("/admin/courses");
      }
    }
    if (error) {
      if ("data" in error) {
        const errorMessage = error as any;
        toast.error(errorMessage.data.message);
      }
    }
  }, [isSuccess, error, userRole]);

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (editCourseData) {
      console.log(editCourseData);
      setCourseInfo({
        name: editCourseData.name,
        description: editCourseData.description,
        price: editCourseData.price,
        estimatedPrice: editCourseData?.estimatedPrice,
        tags: editCourseData.tags,
        level: editCourseData.level,
        categories: editCourseData.categories,
        demoUrl: editCourseData.demoUrl,
        thumbnail: editCourseData?.thumbnail?.url ? editCourseData.thumbnail.url : editCourseData.thumbnail,
      });
      setBenefits(editCourseData.benefits);
      setPrerequisites(editCourseData.prerequisites);
      setCourseContentData(editCourseData.courseData);
    }
  }, [editCourseData]);

  const [courseInfo, setCourseInfo] = useState<any>({
    name: "",
    description: "",
    price: "",
    estimatedPrice: "",
    tags: "",
    level: "",
    categories: "",
    demoUrl: "",
    thumbnail: "",
  });
  const [benefits, setBenefits] = useState([{ title: "" }]);
  const [prerequisites, setPrerequisites] = useState([{ title: "" }]);
  const [courseContentData, setCourseContentData] = useState([
    {
      videoUrl: "",
      title: "",
      description: "",
      videoSection: "Untitled Section",
      videoLength: "",
      links: [
        {
          title: "",
          url: "",
        },
      ],
      iquizz:[{ 
        question: "", 
        options: ["", "", "", ""], 
        correctAnswer: "",
        questionImage: undefined
      } as QuizQuestion],
      suggestion: "",
    },
  ]);

  const [courseData, setCourseData] = useState({});

  const handleSubmit = async () => {
    // Format benefits array
    const formattedBenefits = benefits.map((benefit) => ({
      title: benefit.title,
    }));
    // Format prerequisites array
    const formattedPrerequisites = prerequisites.map((prerequisite) => ({
      title: prerequisite.title,
    }));

    // Format course content array
    const formattedCourseContentData = courseContentData.map(
      (courseContent) => ({
        videoUrl: courseContent.videoUrl,
        title: courseContent.title,
        description: courseContent.description,
        videoSection: courseContent.videoSection,
        videoLength: courseContent.videoLength,
        links: courseContent.links.map((link) => ({
          title: link.title,
          url: link.url,
        })),
        iquizz: courseContent.iquizz.map((quizz) => ({
          question: quizz.question,
          options: quizz.options,
          correctAnswer: quizz.correctAnswer,
          questionImage: quizz.questionImage ? {
            url: quizz.questionImage.url
          } : undefined
        })),
        suggestion: courseContent.suggestion,
      })
    );

    //   prepare our data object
    const data = {
      name: courseInfo.name,
      description: courseInfo.description,
      categories: courseInfo.categories,
      price: courseInfo.price,
      estimatedPrice: courseInfo.estimatedPrice,
      tags: courseInfo.tags,
      thumbnail: courseInfo.thumbnail,
      level: courseInfo.level,
      demoUrl: courseInfo.demoUrl,
      benefits: formattedBenefits,
      prerequisites: formattedPrerequisites,
      courseData: formattedCourseContentData,
    };

    setCourseData(data);
  };

  const handleCourseCreate = async (e: any) => {
    
    const formData = new FormData();
    formData.append('imageedit', image as any);
    formData.append('demoedit', demo as any);
    if (video) {  
      for (let i = 0; i < video.length; i++) {       
         formData.append('videos', video[i] as any);   
      }  
    } 
    
    console.log('[DEBUG-CLIENT-EDIT] Bắt đầu thu thập hình ảnh câu hỏi');
    // Thêm các file hình ảnh câu hỏi vào FormData
    let quizImageCount = 0;
    
    // Check if we have any quiz images
    let hasQuizImages = false;
    courseContentData.forEach(content => {
      content.iquizz.forEach(quizz => {
        if (quizz.questionImage?.file) {
          hasQuizImages = true;
        }
      });
    });
    
    console.log(`[DEBUG-CLIENT-EDIT] Has quiz images: ${hasQuizImages}`);
    
    courseContentData.forEach((content, contentIndex) => {
      content.iquizz.forEach((quizz, quizzIndex) => {
        if (quizz.questionImage?.file) {
          // Tạo uniqueId để đảm bảo mapping chính xác
          const uniqueId = `${contentIndex}_${quizzIndex}`;
          console.log(`[DEBUG-CLIENT-EDIT] Adding quiz image for section=${contentIndex}, quiz=${quizzIndex}, file=${quizz.questionImage.file.name}, uniqueId=${uniqueId}`);
          
          // Đổi tên file để chứa uniqueId ở đầu (trước dấu __) để dễ dàng trích xuất
          const originalName = quizz.questionImage.file.name;
          const fileExtension = originalName.split('.').pop();
          // Format: uniqueId__originalName.ext
          const newFilename = `${uniqueId}__${originalName}`;
          
          // Cần sử dụng tên trường chuẩn 'quiz_images' mà server mong đợi
          const renamedFile = new File(
            [quizz.questionImage.file], 
            newFilename, 
            { type: quizz.questionImage.file.type }
          );
          
          formData.append('quiz_images', renamedFile);
          console.log(`[DEBUG-CLIENT-EDIT] Appended with field name: quiz_images, filename: ${newFilename}`);
          
          quizImageCount++;
        }
      });
    });
    
    console.log(`[DEBUG-CLIENT-EDIT] Đã thêm ${quizImageCount} hình ảnh câu hỏi vào FormData`);
    
    // Double-check FormData contains images
    let hasImagesField = false;
    const formDataKeys: string[] = [];
    formData.forEach((value, key) => {
      formDataKeys.push(key);
      console.log(`[DEBUG-CLIENT-EDIT] FormData key: ${key}, type: ${typeof value}, value: ${value instanceof File ? value.name : value}`);
      if (key === 'quiz_images') hasImagesField = true;
    });
    
    console.log(`[DEBUG-CLIENT-EDIT] Has 'quiz_images' field: ${hasImagesField}`);
    console.log(`[DEBUG-CLIENT-EDIT] FormData keys: ${formDataKeys.join(', ')}`);
    
    // const data = courseData;
    const data = JSON.stringify(courseData);
    formData.append('courseData', data); // Thêm courseData vào FormData
    
    console.log('[DEBUG-CLIENT-EDIT] Sending course data to server...');
    await editCourse({ id: editCourseData?._id, data: formData });
  };

  return (
    <div className="w-full ml-[30px] flex min-h-screen">
      <div className="w-[80%]">
        {active === 0 && (
          <CourseInformation
            courseInfo={courseInfo}
            setCourseInfo={setCourseInfo}
            active={active}
            setActive={setActive}
            setImage={setImage}
            setDemo={setDemo}
            setDemoPreviewUrl={setDemoPreviewUrl}
          />
        )}

        {active === 1 && (
          <CourseData
            benefits={benefits}
            setBenefits={setBenefits}
            prerequisites={prerequisites}
            setPrerequisites={setPrerequisites}
            active={active}
            setActive={setActive}
          />
        )}

        {active === 2 && (
          <CourseContent
            active={active}
            setActive={setActive}
            courseContentData={courseContentData}
            setCourseContentData={setCourseContentData}
            handleSubmit={handleSubmit}
            setVideo={setVideo}
          />
        )}

        {active === 3 && (
          <CoursePreview
            active={active}
            setActive={setActive}
            courseData={courseData}
            handleCourseCreate={handleCourseCreate}
            isEdit={true}
            demopreviewUrl={demopreviewUrl}
          />
        )}
      </div>
      <div className="w-[20%] mt-[100px] h-screen fixed z-[-1] top-18 right-0">
        <CourseOptions active={active} setActive={setActive} />
      </div>
    </div>
  );
};

export default EditCourse;
