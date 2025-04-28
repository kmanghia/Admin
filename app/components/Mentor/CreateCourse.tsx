"use client";
import React, { useEffect, useState } from "react";
import { useCreateCourseMutation } from "@/redux/features/courses/coursesApi";
import { toast } from "react-hot-toast";
import { redirect } from "next/navigation";
import CourseInformation from "../Admin/Course/CourseInformation";
import CourseOptions from "../Admin/Course/CourseOptions";
import CourseData from "../Admin/Course/CourseData";
import CourseContent from "../Admin/Course/CourseContent";
import CoursePreview from "../Admin/Course/CoursePreview";
import { useCreateCourseDraftMutation } from "@/redux/features/courses/courseApi";

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

type Props = {};

const CreateCourse = (props: Props) => {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState<File[] | null>(null);
  const [demo, setDemo] = useState(null);
  const [demopreviewUrl, setDemoPreviewUrl] = useState<string>('');
  const [createCourseDraft, { isLoading, isSuccess, error }] =
  useCreateCourseDraftMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success("Khóa học đã được tạo thành công");
      redirect("/mentor/courses");
    }
    if (error) {
      if ("data" in error) {
        const errorMessage = error as any;
        toast.error(errorMessage.data.message);
      }
    }
  }, [isSuccess, error]);

  const [active, setActive] = useState(0);
  const [courseInfo, setCourseInfo] = useState({
    name: "",
    description: "",
    price: "",
    estimatedPrice: "",
    tags: "",
    level: "",
    categories:"",
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
      videoSection: "Phần không có tiêu đề",
      videoLength: "",
      links: [
        {
          title: "",
          url: "",
        },
      ],
      iquizz: [{ 
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

    const formattedBenefits = benefits.map((benefit) => ({
      title: benefit.title,
    }));
  
    const formattedPrerequisites = prerequisites.map((prerequisite) => ({
      title: prerequisite.title,
    }));


    const formattedCourseContentData = courseContentData.map(
      (courseContent) => ({
        videoUrl: courseContent.videoUrl,
        title: courseContent.title,
        description: courseContent.description,
        videoLength: courseContent.videoLength,
        videoSection: courseContent.videoSection,
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
      totalVideos: courseContentData.length,
      benefits: formattedBenefits,
      prerequisites: formattedPrerequisites,
      courseData: formattedCourseContentData,
    };
    setCourseData(data);
  };

  const handleCourseCreate = async (e: any) => {
    const formData = new FormData();
    formData.append('image', image as any);
    formData.append('demo', demo as any)
    
    if (video) {  
       for (let i = 0; i < video.length; i++) {       
          formData.append('videos', video[i] as any);   
            }  
     } 
     
     console.log('[DEBUG-CLIENT] Bắt đầu thu thập hình ảnh câu hỏi');
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
     
     console.log(`[DEBUG-CLIENT] Has quiz images: ${hasQuizImages}`);
     
     courseContentData.forEach((content, contentIndex) => {
       content.iquizz.forEach((quizz, quizzIndex) => {
         if (quizz.questionImage?.file) {
           // Đảm bảo đúng tên trường là 'quiz_images' và gán trực tiếp file
           console.log(`[DEBUG-CLIENT] Adding quiz image for section=${contentIndex}, quiz=${quizzIndex}, file=${quizz.questionImage.file.name}`);
           
           // Thử append với tên gốc
           formData.append('quiz_images', quizz.questionImage.file);
           quizImageCount++;
         }
       });
     });
     
     console.log(`[DEBUG-CLIENT] Đã thêm ${quizImageCount} hình ảnh câu hỏi vào FormData`);
     
     // Double-check FormData contains images
     let hasImagesField = false;
     const formDataKeys: string[] = [];
     formData.forEach((value, key) => {
       formDataKeys.push(key);
       console.log(`[DEBUG-CLIENT] FormData key: ${key}, type: ${typeof value}, value: ${value instanceof File ? value.name : value}`);
       if (key === 'quiz_images') hasImagesField = true;
     });
     
     console.log(`[DEBUG-CLIENT] Has 'quiz_images' field: ${hasImagesField}`);
     console.log(`[DEBUG-CLIENT] FormData keys: ${formDataKeys.join(', ')}`);

    const data = JSON.stringify(courseData);
    formData.append('courseData', data); // Thêm courseData vào FormData
    console.log(formData);
    if (!isLoading) {
      await createCourseDraft(formData);
    }
  };

  return (
    <div className="w-full flex min-h-screen">
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

export default CreateCourse; 