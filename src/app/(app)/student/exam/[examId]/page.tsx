"use client";
import type { AnswerEvaluation, Question } from "@/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Lightbulb } from "lucide-react";
import { evaluateAnswer } from "@/ai/flows/evaluate-answer";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// Mock exam data (replace with actual data fetching)
const MOCK_EXAM_QUESTIONS: Question[] = [
  { id: "q1", text: "What is the powerhouse of the cell?", keywords: "mitochondria" },
  { id: "q2", text: "Explain the concept of photosynthesis in simple terms.", keywords: "sunlight,water,carbon dioxide,glucose,oxygen" },
  { id: "q3", text: "What is the capital of France?", keywords: "paris" },
];

export default function ExamPage({ params }: { params: { examId: string } }) {
  const { examId } = params;
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerEvaluation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, fetch exam questions based on examId
    setQuestions(MOCK_EXAM_QUESTIONS);
    setAnswers(MOCK_EXAM_QUESTIONS.map(q => ({ questionId: q.id, studentAnswer: "", isLoading: false })));
  }, [examId]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex].studentAnswer = value;
      return newAnswers;
    });
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !currentAnswer) return;

    setIsSubmitting(true);
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex].isLoading = true;
      return newAnswers;
    });

    try {
      const result = await evaluateAnswer({
        question: currentQuestion.text,
        studentAnswer: currentAnswer.studentAnswer,
        keywords: currentQuestion.keywords,
      });

      setAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentQuestionIndex].isCorrect = result.isCorrect;
        newAnswers[currentQuestionIndex].feedback = result.feedback;
        newAnswers[currentQuestionIndex].isLoading = false;
        return newAnswers;
      });

      toast({
        title: result.isCorrect ? "Correct!" : "Needs Improvement",
        description: result.feedback,
        variant: result.isCorrect ? "default" : "destructive",
      });

    } catch (error) {
      console.error("Error evaluating answer:", error);
      toast({
        title: "Error",
        description: "Could not evaluate answer. Please try again.",
        variant: "destructive",
      });
      setAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentQuestionIndex].isLoading = false;
        return newAnswers;
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setExamCompleted(true);
      // Potentially submit all answers to backend here
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev -1);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading exam questions...</p>
      </div>
    );
  }

  if (examCompleted) {
    const correctAnswersCount = answers.filter(a => a.isCorrect).length;
    const score = (correctAnswersCount / questions.length) * 100;
    return (
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary text-center">Exam Completed!</CardTitle>
          <CardDescription className="text-center">
            You scored {score.toFixed(0)}% ({correctAnswersCount} out of {questions.length} correct).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {answers.map((ans, idx) => (
            <Card key={questions[idx].id}>
              <CardHeader>
                 <CardTitle className="text-lg flex items-center">
                   {ans.isCorrect ? <CheckCircle className="text-green-500 mr-2" /> : <XCircle className="text-red-500 mr-2" />}
                   Question {idx + 1}: {questions[idx].text}
                 </CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Your Answer:</strong> {ans.studentAnswer}</p>
                <p className="mt-2"><strong>Feedback:</strong> {ans.feedback}</p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push('/student/dashboard')} className="w-full">
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const progressValue = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-primary">Exam: {examId}</h1>
      <Progress value={progressValue} className="w-full" />
      <p className="text-center text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</p>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Type your answer here..."
            value={currentAnswer?.studentAnswer || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            rows={6}
            disabled={isSubmitting || currentAnswer?.isCorrect !== undefined}
            className="resize-none"
          />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <Button onClick={handlePreviousQuestion} variant="outline" disabled={currentQuestionIndex === 0 || isSubmitting}>
            Previous
          </Button>
          {currentAnswer?.isCorrect === undefined ? (
            <Button onClick={handleSubmitAnswer} disabled={isSubmitting || !currentAnswer?.studentAnswer.trim()}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} disabled={isSubmitting}>
              {currentQuestionIndex === questions.length - 1 ? "Finish Exam" : "Next Question"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {currentAnswer?.isLoading && (
        <Alert>
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <AlertTitle>Evaluating...</AlertTitle>
          <AlertDescription>
            Our AI is analyzing your answer. Please wait a moment.
          </AlertDescription>
        </Alert>
      )}

      {currentAnswer?.isCorrect !== undefined && !currentAnswer.isLoading && (
        <Alert variant={currentAnswer.isCorrect ? "default" : "destructive"} className="bg-opacity-10">
          {currentAnswer.isCorrect ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
          <AlertTitle className="font-semibold">{currentAnswer.isCorrect ? "Correct!" : "Needs Improvement"}</AlertTitle>
          <AlertDescription>
            {currentAnswer.feedback || "No feedback available."}
          </AlertDescription>
        </Alert>
      )}
       <Card className="bg-secondary">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="text-yellow-500" />
            Exam Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc pl-5 space-y-1">
            <li>Read each question carefully before answering.</li>
            <li>Ensure your answer directly addresses the question.</li>
            <li>If keywords are relevant, try to include them naturally in your response.</li>
            <li>Don't navigate away from this page, or your progress may be lost.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
