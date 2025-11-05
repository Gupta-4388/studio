'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Upload, FileText, Lightbulb, Loader2, X, BrainCircuit, Sparkles, Wand2, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeResume, AnalyzeResumeOutput } from '@/ai/flows/analyze-resume-flow';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

type SkillCategory = {
  category: string;
  skills: AnalyzeResumeOutput['extractedSkills'];
};

const proficiencyColors: { [key: string]: string } = {
  Beginner: 'bg-blue-200 text-blue-800',
  Intermediate: 'bg-green-200 text-green-800',
  Advanced: 'bg-yellow-200 text-yellow-800',
  Expert: 'bg-purple-200 text-purple-800',
};


export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResumeOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      setProgress(0);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(timer);
            return 95;
          }
          return prev + 5;
        });
      }, 500);
    }
    return () => {
      clearInterval(timer);
    };
  }, [loading]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setAnalysis(null);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!file) {
      setError('Please select a resume file to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const resumeDataUri = reader.result as string;
        const result = await analyzeResume({ resumeDataUri });
        setProgress(100);
        setAnalysis(result);
        setLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to read the file.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during analysis. Please try again.');
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  const categorizedSkills = analysis?.extractedSkills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, AnalyzeResumeOutput['extractedSkills']>);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Resume Analyzer</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your resume to get instant AI-powered feedback and unlock your potential.
        </p>
      </div>

      <Card className="p-0 overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/20">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Upload className="h-6 w-6 text-accent" />
                Upload Your Resume
              </CardTitle>
              <CardDescription>
                Accepted formats: PDF, DOCX. Max file size: 5MB.
              </CardDescription>
            </div>
            <Input
              ref={fileInputRef}
              id="resume-upload"
              type="file"
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-2">
              {!file ? (
                <Button onClick={() => fileInputRef.current?.click()} size="lg">
                  <Upload className="mr-2" />
                  Select File
                </Button>
              ) : (
                <Button
                  onClick={handleAnalyzeClick}
                  disabled={loading}
                  size="lg"
                  className='bg-accent hover:bg-accent/90'
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" />
                      Analyze My Resume
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {file && !loading && (
          <CardContent className="p-6">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <span className="font-medium">{file.name}</span>
                <Badge variant="secondary">{Math.round(file.size / 1024)} KB</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                <X className="h-4 w-4"/>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Analysis Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 text-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-accent" />
            <p className="text-lg font-semibold">Analyzing your resume...</p>
            <p className="text-muted-foreground">Our AI is working its magic to give you personalized feedback.</p>
            <Progress value={progress} className="w-full max-w-sm mt-4 h-2" />
        </div>
      )}

      {analysis && (
        <div className="space-y-6 animate-in fade-in-50 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-6 w-6 text-accent" />
                  Improvement Insights
                </CardTitle>
                <CardDescription>Actionable feedback to make your resume stand out.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-3 list-disc list-inside">
                  {analysis.improvementInsights.map((insight, index) => (
                    <li key={index} className="leading-relaxed">{insight}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-6 w-6 text-accent" />
                  Extracted Skills
                </CardTitle>
                <CardDescription>An AI-generated overview of the skills identified in your resume.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categorizedSkills && Object.entries(categorizedSkills).map(([category, skills]) => (
                    <div key={category}>
                      <h3 className="font-semibold mb-2">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                          <Badge key={skill.name} variant="secondary" className="text-sm py-1 px-3">
                            {skill.name}
                            <span className={`ml-2 text-xs font-normal px-2 py-0.5 rounded-full ${proficiencyColors[skill.proficiency]}`}>{skill.proficiency}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-accent" />
                Market Skill Analysis
              </CardTitle>
              <CardDescription>How your skills stack up against the top 10 most in-demand skills for your likely role.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={analysis.marketSkillsComparison}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <p className="font-bold">{`${payload[0].payload.name}`}</p>
                            <p className={payload[0].payload.inResume ? 'text-green-500' : 'text-red-500'}>
                              {payload[0].payload.inResume ? 'Found in resume' : 'Not found in resume'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="inResume" barSize={30} radius={[0, 4, 4, 0]}>
                    {analysis.marketSkillsComparison.map((entry, index) => (
                      <LabelList
                        key={`label-${index}`}
                        dataKey="inResume"
                        position="right"
                        formatter={(value: boolean) => (value ? '✅' : '❌')}
                        fontSize={16}
                      />
                    ))}
                    {
                      analysis.marketSkillsComparison.map((entry) => (
                        <Bar
                          key={entry.name}
                          dataKey="inResume"
                          fill={entry.inResume ? 'hsl(var(--accent))' : 'hsl(var(--muted))'}
                        />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
