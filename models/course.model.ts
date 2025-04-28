// Quizz interface nếu đã tồn tại
interface IQuizz extends Document {
  question: string;
  questionImage?: {
    url: string;
  };
  options: string[];
  correctAnswer: string;
}

// Schema cho IQuizz
const iquizzSchema = new Schema<IQuizz>({
  question: { type: String, required: true },
  questionImage: {
    url: String,
  },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
}); 