"use client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, BrainCircuit } from "lucide-react";
import Image from "next/image";

// Mock data for exams
const mockExams = [
  { id: "exam1", title: "Introduction to Algebra Midterm", questionsCount: 10, status: "Available" },
  { id: "exam2", title: "World History Final", questionsCount: 25, status: "Upcoming" },
  { id: "exam3", title: "Physics Quiz 1", questionsCount: 5, status: "Completed" },
];


export default function StudentDashboardPage() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            Welcome, {userProfile?.displayName || "Student"}!
          </CardTitle>
          <CardDescription>
            Here are your available exams and learning resources. Let&apos;s get started!
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Image 
              src="https://picsum.photos/800/300" 
              alt="Student dashboard banner" 
              width={800} 
              height={300} 
              className="rounded-md mb-6 object-cover w-full"
              data-ai-hint="education study" 
            />
          <p className="text-lg">
            Ready to test your knowledge? Select an exam below or explore personalized suggestions to improve your skills.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="text-primary" />
            Your Exams
          </CardTitle>
          <CardDescription>
            View and take your assigned exams.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockExams.length > 0 ? (
            mockExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{exam.title}</CardTitle>
                  <CardDescription>{exam.questionsCount} questions</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    exam.status === "Available" ? "bg-green-100 text-green-700" : 
                    exam.status === "Upcoming" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {exam.status}
                  </span>
                  {exam.status === "Available" && (
                    <Button asChild>
                      <Link href={`/student/exam/${exam.id}`}>Start Exam</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No exams available at the moment. Check back later!</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            Personalized Suggestions
          </CardTitle>
          <CardDescription>
            AI-powered recommendations to help you improve. (Coming Soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BrainCircuit size={48} className="mx-auto mb-4" />
            <p>Our AI is working hard to generate personalized learning suggestions for you. This feature will be available soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
