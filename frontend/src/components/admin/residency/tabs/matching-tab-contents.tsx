import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FinalMatchRow } from "@/app/api/utils"
import FinalMatchTable from "../tables/final-match-table"

export function MatchingTabContents({ matches }: { matches: FinalMatchRow[] }) {
  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Final Matches</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <FinalMatchTable data={matches ?? []} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

