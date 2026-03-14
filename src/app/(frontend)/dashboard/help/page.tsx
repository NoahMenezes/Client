import React, { Suspense } from 'react'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { IconExternalLink, IconLifebuoy, IconBook, IconMessageCircle } from '@tabler/icons-react'

export default function HelpPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={<div className="h-12 border-b bg-white" />}>
        <SiteHeader title="Help & Support" />
      </Suspense>
      <div className="flex flex-1 flex-col p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <IconLifebuoy className="h-8 w-8 text-blue-600" />
            How can we help you?
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Find answers, learn how to use the CRM, or get in touch with our team.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <IconMessageCircle className="h-6 w-6 text-blue-500" />
                Contact Support via LinkedIn
              </CardTitle>
              <CardDescription className="text-sm pt-2">
                Need direct assistance or want to request a new feature? Connect with us on LinkedIn. We actively monitor our page and respond to all inquiries promptly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="https://www.linkedin.com/company/frover-io/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-[#0077b5] hover:bg-[#006399] text-white flex items-center gap-2">
                  Visit Frover.io on LinkedIn <IconExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <IconBook className="h-6 w-6 text-emerald-500" />
                Quick Guide
              </CardTitle>
              <CardDescription className="text-sm pt-2">
                A brief overview of how to get the most out of Perfect Knot CRM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <div>
                <strong className="text-gray-900 block mb-1">1. Master Your Leads</strong>
                Track all wedding inquiries in the pipeline. Move them from &quot;New&quot; to &quot;Confirmed&quot;, and generate customized quotations instantly.
              </div>
              <div>
                <strong className="text-gray-900 block mb-1">2. Manage Your Calendar</strong>
                Keep an eye on key dates. Check-ins, Check-outs, and Wedding dates automatically sync to your dashboard calendar for easy tracking.
              </div>
              <div>
                <strong className="text-gray-900 block mb-1">3. Team Isolation</strong>
                Every user gets their own dedicated workspace. Leads, quotations, and employees are securely scoped directly to your account.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
