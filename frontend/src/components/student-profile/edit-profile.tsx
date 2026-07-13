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
import { StudentJoinedWithProfile } from "@/types/student"
import { Textarea } from "../ui/textarea"
import { createClient } from "@/lib/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { DialogClose } from "../ui/dialog"

const supabase = createClient();

const studentProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  qca: z.string().optional(),
  pronouns: z.string().optional(),
  description: z.string().optional(),
  github_link: z.string().url().optional(),
  linkedin_link: z.string().url().optional(),
  personal_site_link: z.string().url().optional(),
})

export function EditProfileForm({ currentValues }: { currentValues: StudentJoinedWithProfile }) {
  const router = useRouter();

  const form = useForm<z.infer<typeof studentProfileSchema>>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: currentValues.name || "",
      qca: currentValues.student_profile.qca || "",
      pronouns: currentValues.student_profile.pronouns || "",
      description: currentValues.student_profile.description || "",
      github_link: currentValues.student_profile.github_link || "",
      linkedin_link: currentValues.student_profile.linkedin_link || "",
      personal_site_link: currentValues.student_profile.personal_site_link || "",
    },
  })

  async function uploadFile(
    bucket: string,
    file: File,
    userId: string
  ): Promise<string | null> {
    // Create a unique filename to avoid collisions
    const fileName = `${userId}-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      return null;
    }
    // Retrieve the public URL for the uploaded file.
    const returnData = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return returnData.data.publicUrl;
  }

  async function onSubmit(values: z.infer<typeof studentProfileSchema>) {
    try {
      let updatedAvatarUrl = currentValues.student_profile.avatar_url;
      let updatedCVUrl = currentValues.student_profile.cv_url;

      if (avatarFile) {
        const uploadedAvatarUrl = await uploadFile(
          "avatars",
          avatarFile,
          currentValues.id
        );
        if (uploadedAvatarUrl) {
          updatedAvatarUrl = uploadedAvatarUrl;
        }
      }

      if (cvFile) {
        const uploadedCVUrl = await uploadFile("cvs", cvFile, currentValues.id);
        if (uploadedCVUrl) {
          updatedCVUrl = uploadedCVUrl;
        }
      }

      const { data: studentProfileData, error: studentProfileError } =
        await supabase
          .from("student_profile")
          .update({
            qca: values.qca,
            pronouns: values.pronouns,
            description: values.description,
            avatar_url: updatedAvatarUrl,
            cv_url: updatedCVUrl,
            github_link: values.github_link,
            linkedin_link: values.linkedin_link,
            personal_site_link: values.personal_site_link,
          })
          .eq("id", currentValues.student_profile.id);

      if (studentProfileError) {
        console.error(
          "Error updating student_profile:",
          studentProfileError
        );
        return;
      }

      // Update the student table (in this case, just the name field).
      const { data: studentData, error: studentError } = await supabase
        .from("student")
        .update({
          name: values.name,
        })
        .eq("id", currentValues.id);

      if (studentError) {
        console.error("Error updating student:", studentError);
        return;
      }

      router.refresh()
    } catch (error) {
      console.error("Error during update:", error);
    }
  }

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cvFile, setCVFile] = useState<File | null>(null);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>
                Your full name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Profile Picture</FormLabel>
          <FormControl>
            <Input
              type="file"
              onChange={(e) => {
                const file =
                  e.target.files && e.target.files.length > 0
                    ? e.target.files[0]
                    : null;
                setAvatarFile(file);
              }}
            />
          </FormControl>
          <FormDescription>
            A professional photo of yourself.
          </FormDescription>
        </FormItem>

        <FormField
          control={form.control}
          name="qca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>QCA</FormLabel>
              <FormControl>
                <Input placeholder="4.0" {...field} />
              </FormControl>
              <FormDescription>
                Your current QCA. ISE does not verify nor attest to these values.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pronouns"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personal Pronouns</FormLabel>
              <FormControl>
                <Input placeholder="he/him" {...field} />
              </FormControl>
              <FormDescription>
                Your preferred personal pronouns.
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
                <Textarea placeholder="Hi, I'm..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Your CV</FormLabel>
          <FormControl>
            <Input
              type="file"
              onChange={(e) => {
                const file =
                  e.target.files && e.target.files.length > 0
                    ? e.target.files[0]
                    : null;
                setCVFile(file);
              }}
            />
          </FormControl>
          <FormDescription>Upload your CV.</FormDescription>
        </FormItem>

        <FormField
          control={form.control}
          name="linkedin_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Profile</FormLabel>
              <FormControl>
                <Input placeholder="linkedin.com/..." {...field} />
              </FormControl>
              <FormDescription>
                A link to your personal LinkedIn Profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="personal_site_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personal Site Link</FormLabel>
              <FormControl>
                <Input placeholder="A link to your personal site." {...field} />
              </FormControl>
              <FormDescription>
                A link to your personal GitHub profile.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="github_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub Link</FormLabel>
              <FormControl>
                <Input placeholder="A link to your GitHub" {...field} />
              </FormControl>
              <FormDescription>
                A link to your personal GitHub profile.
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
