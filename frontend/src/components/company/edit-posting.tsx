"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "../ui/textarea"
import { createClient } from "@/lib/client"
import { useRouter } from "next/navigation"
import { DialogClose } from "../ui/dialog"
import { JobPosting } from "@/types/job-posting"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"

const supabase = createClient();

const jobPostingSchema = z.object({
  residencyNo: z.string(),
  jobTitle: z.string(),
  description: z.string().optional(),
  salary: z.coerce.number(),
  accommodationSupport: z.boolean(),
  contactEmail: z.string().optional(),
  location: z.string(),
  positionCount: z.coerce.number(),
})

export function EditPostingForm({ currentValues }: { currentValues: JobPosting }) {
  const router = useRouter();

  const form = useForm<z.infer<typeof jobPostingSchema>>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      residencyNo: currentValues.residency || "1",
      jobTitle: currentValues.job_title || "None",
      description: currentValues.description,
      salary: currentValues.salary || 0,
      accommodationSupport: currentValues.accommodation_support || false,
      contactEmail: currentValues.contact_email,
      location: currentValues.location || "Dublin",
      positionCount: currentValues.position_count || 0,
    },
  })

  async function onSubmit(values: z.infer<typeof jobPostingSchema>) {
    try {
      const { data: jpData, error: jpError } =
        await supabase
          .from("job_posting")
          .update({
            residency: values.residencyNo,
            position_count: values.positionCount,
            location: values.location,
            contact_email: values.contactEmail,
            description: values.description,
            accommodation_support: values.accommodationSupport,
            salary: values.salary,
            job_title: values.jobTitle
          })
          .eq("id", currentValues.id);

      if (jpError) {
        console.error(
          "Error updating student_profile:",
          jpError
        );
        return;
      }
      router.refresh()
    } catch (error) {
      console.error("Error during update:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title*</FormLabel>
              <FormControl>
                <Input placeholder="SWE Intern" {...field} />
              </FormControl>
              <FormDescription>
                The job title the student will have during the residency.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="residencyNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Residency*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Residency..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Residency 1</SelectItem>
                  <SelectItem value="1+2">Residency 1 + 2</SelectItem>
                  <SelectItem value="2">Residency 2</SelectItem>
                  <SelectItem value="3">Residency 3</SelectItem>
                  <SelectItem value="4">Residency 4</SelectItem>
                  <SelectItem value="5">Residency 5</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Which residency this posting is for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary*</FormLabel>
              <FormControl>
                <Input placeholder="3000" type="number" {...field} />
              </FormControl>
              <FormDescription>
                The MONTHLY salary of the position. If unknown or undisclosed, enter "-1".
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accommodationSupport"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-x-4">
                <FormLabel>Accommodation Support*</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      if (typeof checked === "boolean") field.onChange(checked);
                    }}
                  />
                </FormControl>
              </div>
              <FormDescription>
                Whether or not accommodation support is provided to the student; whether that be a stipend, housing, or other.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="positionCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position Count*</FormLabel>
              <FormControl>
                <Input placeholder="2" {...field} />
              </FormControl>
              <FormDescription>
                How many students will be accepted for this position.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="At ACME, you'll be working on..." {...field} />
              </FormControl>
              <FormDescription>
                Describe what the student will be doing on residency, technology used, nice-to-haves, responsibilities, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input placeholder="hello@example.com" {...field} />
              </FormControl>
              <FormDescription>
                The email that candidates are to contact with any queries, or when they receive their interview slots.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogClose asChild>
          <Button type="submit">Save</Button>
        </DialogClose>
      </form>
    </Form>
  )
}
