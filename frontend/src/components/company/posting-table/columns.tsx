"use client"

import { JobPosting } from "@/types/job-posting"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { EditPostingForm } from "../edit-posting"
import { DialogTitle } from "@radix-ui/react-dialog"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { SupabaseClient } from "@supabase/supabase-js"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

async function deletePosting(id: string, supabase: SupabaseClient, router: AppRouterInstance) {

	try {
		const { error } =
			await supabase
				.from("job_posting")
				.delete()
				.eq("id", id);

		if (error) {
			console.error(
				"Error during deletion: ",
				error
			);
			return;
		}
		router.refresh()
	} catch (error) {
		console.error("Error during deletion: ", error);
	}
}

export const columns: ColumnDef<JobPosting>[] = [
	{
		accessorKey: "id",
		header: "ID",
	},
	{
		accessorKey: "residency",
		header: "Residency #",
	},
	{
		accessorKey: "job_title",
		header: "Job Title",
	},
	{
		accessorKey: "position_count",
		header: "Positions",
	},
	{
		accessorKey: "salary",
		header: "Monthly Salary",
	},
	{
		accessorKey: "accommodation_support",
		header: "Accommodation Support?",
		cell: ({ row }) => {
			const acc_supp = row.getValue("accommodation_support")

			return (
				<div>
					{acc_supp ? "Yes" : "No"}
				</div>
			)
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const posting = row.original
			const supabase = createClient();
			const router = useRouter();

			return (
				<Dialog>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>Actions</DropdownMenuLabel>
							<DropdownMenuItem>View Applicants</DropdownMenuItem>
							<DialogTrigger asChild>
								<DropdownMenuItem>Edit Posting</DropdownMenuItem>
							</DialogTrigger>
							<DropdownMenuItem
								onClick={() => deletePosting(posting.id, supabase, router)}
								className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-700 dark:bg-red-700/40 dark:text-red-500"
							>
								Delete Posting
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<DialogContent className="h-3/4 overflow-scroll">
						<DialogHeader>
							<DialogTitle>Edit Posting</DialogTitle>
						</DialogHeader>
						<EditPostingForm currentValues={posting} />
					</DialogContent>
				</Dialog>
			)
		},
	},
]
