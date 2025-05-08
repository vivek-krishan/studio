"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
// In a real app, you would import functions to save to Firestore
// import { collection, addDoc } from "firebase/firestore";
// import { db } from "@/lib/firebase";

const questionSchema = z.object({
  text: z.string().min(5, { message: "Question text must be at least 5 characters." }),
  keywords: z.string().min(1, { message: "Please provide at least one keyword." }).regex(/^[a-zA-Z0-9, ]+$/, { message: "Keywords can only contain letters, numbers, commas, and spaces."}),
});

const createExamSchema = z.object({
  title: z.string().min(3, { message: "Exam title must be at least 3 characters." }),
  questions: z.array(questionSchema).min(1, { message: "Please add at least one question." }),
});

export default function CreateExamPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof createExamSchema>>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      title: "",
      questions: [{ text: "", keywords: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  async function onSubmit(values: z.infer<typeof createExamSchema>) {
    setIsLoading(true);
    console.log("Exam data:", values);
    // TODO: Implement saving exam data to Firebase Firestore
    try {
      // Example Firestore save (uncomment and adapt when db is set up)
      // const docRef = await addDoc(collection(db, "exams"), {
      //   ...values,
      //   createdBy: auth.currentUser?.uid, // Assuming you have auth context
      //   createdAt: serverTimestamp(),
      // });
      // console.log("Document written with ID: ", docRef.id);

      // Mock successful save
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Exam Created!",
        description: `The exam "${values.title}" has been successfully created.`,
      });
      router.push("/teacher/dashboard"); // Redirect to teacher dashboard
    } catch (error) {
      console.error("Error creating exam:", error);
      toast({
        title: "Error",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">Create New Exam</CardTitle>
        <CardDescription>
          Design your exam by adding a title and defining questions with their relevant keywords for AI evaluation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Exam Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Midterm Exam - Chapter 1-5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-primary">Questions</h3>
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 border-dashed">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`questions.${index}.text`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question {index + 1}</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter question text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`questions.${index}.keywords`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keywords (comma-separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., photosynthesis, chlorophyll, sunlight" {...field} />
                          </FormControl>
                           <FormDescription>
                            These keywords will be used by the AI to evaluate answers.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      className="mt-4 float-right"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Question
                    </Button>
                  )}
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ text: "", keywords: "" })}
                className="flex items-center"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </div>
            
            {form.formState.errors.questions && !form.formState.errors.questions.root && (
                 <FormMessage>{form.formState.errors.questions.message}</FormMessage>
            )}
             {form.formState.errors.questions?.root && (
                 <FormMessage>{form.formState.errors.questions.root.message}</FormMessage>
            )}


            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Exam
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
