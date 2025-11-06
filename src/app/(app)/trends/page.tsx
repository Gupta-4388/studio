
'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getJobTrends,
  GetJobTrendsOutput,
} from '@/ai/flows/get-job-trends-flow';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { useToast } from '@/hooks/use-toast';

export default function TrendsPage() {
  const [trendsData, setTrendsData] = useState<GetJobTrendsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      const cachedData = localStorage.getItem('jobTrendsData');
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          // Simple validation to ensure the data structure is what we expect
          if (parsedData.salaryTrends && parsedData.marketDemand && parsedData.marketDemand.length === 6) {
            setTrendsData(parsedData);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached data", e);
          // If parsing fails, fetch new data
        }
      }
      try {
        const data = await getJobTrends();
        setTrendsData(data);
        localStorage.setItem('jobTrendsData', JSON.stringify(data));
      } catch (error) {
        console.error('Failed to fetch job trends:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch job market trends. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-lg">Gathering Latest Market Data...</span>
        </div>
      </div>
    );
  }

  if (!trendsData) {
    return (
      <div className="text-center text-muted-foreground">
        No trend data available.
      </div>
    );
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
      <Card className="col-span-1 lg:col-span-2 transition-transform transform hover:scale-[1.02]">
        <CardHeader>
          <CardTitle>Job Market Trends</CardTitle>
          <CardDescription>
            Visualize current job trends, in-demand skills, and salary benchmarks.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card className="col-span-1 lg:col-span-2 transition-transform transform hover:scale-[1.02]">
        <CardHeader>
          <CardTitle>Average Salary Trends (Last 12 Months)</CardTitle>
          <CardDescription>
            Monthly estimated salary for popular tech roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px] w-full">
            <LineChart data={trendsData.salaryTrends}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickFormatter={formatCurrency} width={80} />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatCurrency(value as number)}
                    indicator="line"
                  />
                }
              />
              <Legend />
              <Line
                dataKey="Software Engineer"
                type="monotone"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="Data Scientist"
                type="monotone"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="Product Manager"
                type="monotone"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="DevOps Engineer"
                type="monotone"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="UX/UI Designer"
                type="monotone"
                stroke="hsl(var(--chart-5))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="Cybersecurity Analyst"
                type="monotone"
                stroke="hsl(var(--chart-1))"
                strokeDasharray="3 3"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="transition-transform transform hover:scale-[1.02]">
        <CardHeader>
          <CardTitle>Current Market Demand</CardTitle>
          <CardDescription>
            Demand score indicates how frequently a role appears in job openings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[400px] w-full">
            <BarChart
              data={trendsData.marketDemand}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="role"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={140}
                interval={0}
              />
              <XAxis type="number" dataKey="demand" hide />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="demand" fill="hsl(var(--chart-1))" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card className="transition-transform transform hover:scale-[1.02]">
        <CardHeader>
          <CardTitle>Job Openings by Location</CardTitle>
          <CardDescription>
            Number of open positions in key tech hubs across India and the world.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[400px] w-full">
            <BarChart
              data={trendsData.jobOpeningsByLocation}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="location"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={120}
                interval={0}
              />
              <XAxis type="number" dataKey="openings" hide />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent formatter={(value) => formatNumber(value as number)} indicator="dot" />}
              />
              <Bar dataKey="openings" fill="hsl(var(--accent))" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

    </div>
  );
}
