import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { InterviewTableProps } from "@/app/api/utils"
import InterviewsTable from "../tables/interviews-table"

export default function InterviewsTabContents({ interviews }: { interviews: InterviewTableProps }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Interviews</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <InterviewsTable data={interviews.students ?? []} />
        </div>
      </CardContent>
    </Card>
  )
}
