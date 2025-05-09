import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import SrichakraText from '@/components/custom/SrichakraText';
import { ArrowLeft } from 'lucide-react';
import careerImage from '../assets/images/slideshow/career.png';

// Define the form schema for career assessment
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid age.",
  }),
  educationLevel: z.string().min(1, { message: "Please select your education level." }),
  interests: z.string().min(10, { message: "Please describe your interests in at least 10 characters." }),
  strengths: z.string().min(10, { message: "Please describe your strengths in at least 10 characters." }),
  careerGoals: z.string().min(10, { message: "Please describe your career goals in at least 10 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

const Career = () => {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [careerSuggestions, setCareerSuggestions] = useState<string[]>([]);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      educationLevel: "",
      interests: "",
      strengths: "",
      careerGoals: "",
    },
  });

  // Function to generate career suggestions based on form inputs
  const generateCareerSuggestions = (data: FormValues) => {
    // This is a simple mock implementation
    // In a real app, this would be more sophisticated, possibly using an API
    
    const interests = data.interests.toLowerCase();
    const strengths = data.strengths.toLowerCase();
    const goals = data.careerGoals.toLowerCase();
    
    const suggestions: string[] = [];
    
    // Generate suggestions based on interests and strengths
    if (interests.includes('computer') || interests.includes('programming') || 
        interests.includes('coding') || strengths.includes('problem solving') ||
        strengths.includes('logical')) {
      suggestions.push('Software Development');
      suggestions.push('Data Science');
      suggestions.push('Web Development');
    }
    
    if (interests.includes('art') || interests.includes('design') || 
        strengths.includes('creative') || strengths.includes('visual')) {
      suggestions.push('Graphic Design');
      suggestions.push('UI/UX Design');
      suggestions.push('Digital Marketing');
    }
    
    if (interests.includes('science') || interests.includes('research') || 
        strengths.includes('analytical') || goals.includes('research')) {
      suggestions.push('Scientific Research');
      suggestions.push('Laboratory Work');
      suggestions.push('Biotechnology');
    }
    
    if (interests.includes('people') || interests.includes('helping') || 
        strengths.includes('communication') || goals.includes('helping')) {
      suggestions.push('Counseling');
      suggestions.push('Human Resources');
      suggestions.push('Social Work');
    }
    
    if (interests.includes('business') || interests.includes('management') || 
        strengths.includes('leadership') || goals.includes('business')) {
      suggestions.push('Business Management');
      suggestions.push('Entrepreneurship');
      suggestions.push('Marketing');
    }
    
    // If no specific suggestions, provide general ones
    if (suggestions.length === 0) {
      return [
        'Education and Teaching',
        'Healthcare Services',
        'Information Technology',
        'Business Administration',
        'Creative Arts'
      ];
    }
    
    return suggestions;
  };

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    const suggestions = generateCareerSuggestions(data);
    setCareerSuggestions(suggestions);
    setIsSubmitted(true);
    
    toast({
      title: "Assessment Completed",
      description: "Your career assessment has been processed.",
    });
  };

  return (
    <div className="min-h-screen bg-[#EDF6F9]">
      {/* Header */}
      <header className="bg-[#006D77] text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={careerImage} 
              alt="Career Counseling" 
              className="w-10 h-10 mr-2"
            />
            <SrichakraText className="text-2xl font-bold text-white">
              Career Counseling
            </SrichakraText>
          </div>
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-[#005964]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {!isSubmitted ? (
          <div className="max-w-3xl mx-auto">
            <Card className="mb-8 border-t-4 border-t-[#006D77]">
              <CardHeader>
                <CardTitle>Career Assessment</CardTitle>
                <CardDescription>
                  Fill out this form to receive personalized career guidance based on your interests, strengths, and goals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your age" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="educationLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Education Level</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select education level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="high_school">High School</SelectItem>
                                <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                <SelectItem value="master">Master's Degree</SelectItem>
                                <SelectItem value="phd">PhD or Doctorate</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="interests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interests</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your interests, hobbies, and what you enjoy doing"
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            What subjects, activities, or topics do you find most interesting?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="strengths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Strengths & Skills</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your key strengths and skills"
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            What are you good at? Consider both technical and soft skills.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="careerGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Career Goals</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your career aspirations and goals"
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Where do you see yourself professionally in the future?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#006D77] hover:bg-[#005964]"
                    >
                      Submit Assessment
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <Card className="mb-8 border-t-4 border-t-[#006D77]">
              <CardHeader>
                <CardTitle>Your Career Recommendations</CardTitle>
                <CardDescription>
                  Based on your assessment, here are some career paths that may suit your interests, 
                  strengths, and goals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {careerSuggestions.map((career, index) => (
                      <div 
                        key={index}
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <h3 className="font-medium text-lg text-[#006D77] mb-2">{career}</h3>
                        <p className="text-gray-600 text-sm">
                          This career path aligns with your profile. Consider exploring this field further.
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-[#E3F6F9] p-4 rounded-lg mt-6">
                    <h3 className="font-medium text-lg mb-2">Next Steps</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Research these career paths in more detail</li>
                      <li>Speak with professionals in these fields</li>
                      <li>Look into educational requirements and training opportunities</li>
                      <li>Consider job shadowing or internship opportunities</li>
                      <li>Schedule a one-on-one counseling session for more personalized guidance</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Retake Assessment
                  </Button>
                  <Button 
                    className="flex-1 bg-[#006D77] hover:bg-[#005964]"
                    onClick={() => {
                      toast({
                        title: "Appointment Request Sent",
                        description: "We'll contact you to schedule a counseling session.",
                      });
                    }}
                  >
                    Book Counseling Session
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto mt-8">
          <h2 className="text-2xl font-bold mb-4 text-[#006D77]">About Career Counseling</h2>
          <div className="prose max-w-none">
            <p>
              Career counseling is a guided process that helps students and individuals discover their 
              strengths, interests, and aptitudes to make smart educational and career choices. Our 
              approach combines both modern assessment tools and traditional wisdom for holistic guidance.
            </p>
            <h3 className="mt-4 font-semibold">Benefits of Career Counseling:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Better understanding of your natural talents and abilities</li>
              <li>Identification of suitable career options based on your profile</li>
              <li>Clarity on educational pathways to achieve your career goals</li>
              <li>Increased confidence in your career decisions</li>
              <li>Support for career transitions and professional growth</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="bg-[#006D77] text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>© 2025 Srichakra Career Counseling. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Career;
