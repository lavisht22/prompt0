import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import supabase from "utils/supabase";

// Add date formatting function
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();

  // Add ordinal suffix
  const suffix = ["th", "st", "nd", "rd"][day % 10 > 3 ? 0 : day % 10] || "th";
  return `${day}${suffix} ${month} ${year}`;
};

// Add helper function to generate date range
const getLast30Days = () => {
  const dates = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // Format date as YYYY-MM-DD to match database format
    const formattedDate = date.toISOString().split("T")[0];
    dates.push({
      day: formattedDate,
      prompt_tokens: 0,
      completion_tokens: 0,
      count: 0,
      errors: 0,
    });
  }
  return dates;
};

type Stats = {
  day: string;
  prompt_tokens: number;
  completion_tokens: number;
  count: number;
  errors: number;
};

export default function WorkspaceDashboardPage() {
  const [data, setData] = useState<Stats[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: apiData, error } = await supabase.rpc("get_daily_stats", {
          days: 30,
        });

        if (error) throw error;

        // Create a map of existing data
        const dataMap = new Map(apiData.map((item: Stats) => [item.day, item]));

        // Merge with complete date range
        const completeData = getLast30Days().map((defaultDay) => ({
          ...defaultDay,
          ...(dataMap.get(defaultDay.day) || {}),
        }));

        setData(completeData);
      } catch {
        toast.error("Oops! Something went wrong. Unable to load stats.");
      }
    };

    init();
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center bg-background px-3 h-12 border-b">
        <div className="flex items-center space-x-2">
          <h2 className="font-medium">Dashboard</h2>
        </div>
      </div>

      <div className="w-full p-4 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tickFormatter={formatDate}
              angle={-25}
              textAnchor="end"
              height={60}
              style={{ fontSize: "0.75rem", fontWeight: 500 }}
            />
            <YAxis style={{ fontSize: "0.75rem", fontWeight: 500 }} />
            <Tooltip
              labelFormatter={formatDate}
              contentStyle={{ fontSize: "0.75rem", borderRadius: "1rem" }}
            />

            <Bar
              dataKey="prompt_tokens"
              name="Prompt Tokens"
              stackId="a"
              fill="#A1A1AA"
            />
            <Bar
              dataKey="completion_tokens"
              name="Completion Tokens"
              stackId="a"
              fill="#3F3F46"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
