
'use client'

import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Input } from "@/components/ui/input"
import { createCompany } from '@/app/api/utils'

import { CardHeader } from './card'
import { CardDescription } from './card'
import { Card } from './card'
import { CardTitle } from './card'
import { CardContent } from './card'

// 1) Zod schemas
const companyProfileSchema = z.object({
  subtitle: z.string().min(1, 'Subtitle is required'),
  avatar: z.string().url('Must be a valid URL'),
  banner_image: z.string().url('Must be a valid URL'),
  description: z.string().min(1, 'Description is required'),
})

const newCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  profile: companyProfileSchema,
})

export type NewCompanyDTO = z.infer<typeof newCompanySchema>

// 2) Default values
const initialValues: NewCompanyDTO = {
  name: '',
  profile: {
    subtitle: '',
    avatar: '',
    banner_image: '',
    description: '',
  },
}

// 3) Component
export default function ResidencyCreationForm() {
  const [step, setStep] = React.useState(0)
  const steps = ['Basic Info', 'Profile Images']

  const methods = useForm<NewCompanyDTO>({
    resolver: zodResolver(newCompanySchema),
    defaultValues: initialValues,
    mode: 'onTouched',
  })

  const {
    handleSubmit,
    trigger,
    formState: { isSubmitting },
  } = methods

  // Only validate the current step’s fields before advancing
  const onNext = async () => {
    const valid = await trigger(
      step === 0
        ? ['name'] // step 0: only company name
        : ['profile.subtitle', 'profile.avatar', 'profile.banner_image', 'profile.description']
    )
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const onBack = () => setStep((s) => Math.max(s - 1, 0))

  const onSubmit = async (data: NewCompanyDTO) => {
    console.log('🎉 Submitting:', data)
    const company = await createCompany(data)
    methods.reset(initialValues)
    setStep(0)
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center space-x-2">
          {steps.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`rounded-full w-4 h-4 ${i <= step ? 'bg-primary' : 'bg-primary/30'}`} />
              {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-primary' : 'bg-primary/30'}`} />}
            </React.Fragment>
          ))}
        </div>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Create Residency Company</CardTitle>
            <CardDescription>{steps[step]}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {step === 0 && (
                  <FormField
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Induct" />
                        </FormControl>
                        <FormMessage />
                        <FormDescription>The name of your corporation</FormDescription>
                      </FormItem>
                    )}
                  />
                )}

                {step === 1 && (
                  <>
                    <FormField
                      name="profile.subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Empowering creators everywhere" />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>A short tagline for your company</FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="profile.avatar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/logo.png" />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>Public URL to your company logo</FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="profile.banner_image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banner Image URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/banner.png" />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>Public URL for your banner image</FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="profile.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="What your company does…" />
                          </FormControl>
                          <FormMessage />
                          <FormDescription>A longer description of your mission</FormDescription>
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Navigation buttons */}
                <div className="flex justify-between">
                  <Button variant="secondary" onClick={onBack} disabled={step === 0}>
                    Back
                  </Button>
                  {step < steps.length - 1 ? (
                    <Button onClick={onNext}>Next</Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting}>
                      {!isSubmitting ? 'Submit' : 'Submitting...'}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  )
}

