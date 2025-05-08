"use client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, BarChart3, Users } from "lucide-react";
import Image from "next/image";

// Mock data for created exams
const mockCreatedExams = [
  { id: "exam1", title: "Introduction to Algebra Midterm", studentsTaken: 25, averageScore: "78%" },
  { id: "exam2", title: "World History Final", studentsTaken: 18, averageScore: "82%" },
];

export default function TeacherDashboardPage() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">
            Welcome, {userProfile?.displayName || "Teacher"}!
          </CardTitle>
          <CardDescription>
            Manage your exams, view student performance, and create new assessments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Image 
              src="https://picsum.photos/800/300" 
              alt="Teacher dashboard banner" 
              width={800} 
              height={300} 
              className="rounded-md mb-6 object-cover w-full"
              data-ai-hint="classroom teacher" 
            />
          <p className="text-lg">
            Use the tools below to streamline your evaluation process and gain insights into student learning.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="text-primary" />
              Create New Exam
            </CardTitle>
            <CardDescription>Design and publish new exams for your students.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/teacher/create-exam">Create Exam</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="text-primary" />
              View Reports
            </CardTitle>
            <CardDescription>Analyze student performance and exam statistics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              View Reports (Coming Soon)
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-primary" />
              Manage Students
            </CardTitle>
            <CardDescription>Oversee student accounts and progress.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Manage Students (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Created Exams</CardTitle>
          <CardDescription>Overview of exams you have created.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockCreatedExams.length > 0 ? (
            mockCreatedExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{exam.title}</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <p>Students Taken: {exam.studentsTaken}</p>
                  <p>Average Score: {exam.averageScore}</p>
                  <Button variant="link" asChild className="p-0 h-auto justify-start">
                    <Link href={`/teacher/exam-details/${exam.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>You haven&apos;t created any exams yet. <Link href="/teacher/create-exam" className="text-primary hover:underline">Create one now!</Link></p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
