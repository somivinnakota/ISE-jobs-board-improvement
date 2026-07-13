// src/components/deadlines/UpcomingDeadlines.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UpcomingDeadlines() {
  // Mock data: one deadline
  const deadlines = [
    {
      id: "1",
      title: "R1 Placements Finalised",
      due_date: "2025-06-01T00:00:00.000Z",
      status: "upcoming",
    },
    {
      id: "2",
      title: "R2 Placements Finalised",
      due_date: "2025-06-01T00:00:00.000Z",
      status: "upcoming",
    },
    {
      id: "3",
      title: "R3 Placements Finalised",
      due_date: "2025-06-01T00:00:00.000Z",
      status: "upcoming",
    },
    {
      id: "4",
      title: "R4 Placements Finalised",
      due_date: "2025-06-01T00:00:00.000Z",
      status: "upcoming",
    },
  ];

  return (
    <Card className="w-full bg-black text-white dark:bg-white dark:text-black">
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.map((d) => {
          const dueDate = new Date(d.due_date);
          const formattedDate = dueDate.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return (
            <div
              key={d.id}
              className="flex justify-between items-center py-2 border-b last:border-b-0"
            >
              <div>
                <h3 className="font-medium">{d.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Due {formattedDate}
                </p>
              </div>
              <Badge variant="default" className="bg-white text-black dark:bg-black dark:text-white">
                {d.status === "upcoming" ? "Upcoming" : "Past"}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
