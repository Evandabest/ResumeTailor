"use client";

import { useState } from "react";
import Link from "next/link";
import { FaCheckCircle, FaTimesCircle, FaRegCircle, FaArrowRight, FaGithub, FaFileAlt, FaChartLine, FaHeadset, FaDownload } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Calculate yearly price (20% discount)
  const yearlyPrice = 9.99 * 12 * 0.8;

  return (
    <div className="container mx-auto py-12 px-4 md:py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="mt-4 text-xl text-gray-600">
          Select the plan that best fits your needs and take your resume to the next level.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center mb-10 gap-4">
        <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
          Monthly
        </span>
        <Switch
          checked={billingCycle === "yearly"}
          onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
        />
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-gray-900" : "text-gray-500"}`}>
            Yearly
          </span>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Save 20%
          </Badge>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Free Tier */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription className="mt-1.5">Get started with the basics</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">$0</div>
                <div className="text-sm text-gray-500">Forever free</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <FeatureItem icon={<FaFileAlt />} text="3 resume customizations per month" />
              <FeatureItem icon={<FaGithub />} text="Basic GitHub integration" />
              <FeatureItem icon={<FaDownload />} text="Standard export formats (PDF, DOCX)" />
              <FeatureItem icon={<FaRegCircle />} text="Community support" isDisabled />
              <FeatureItem icon={<FaRegCircle />} text="Resume performance analytics" isDisabled />
              <FeatureItem icon={<FaRegCircle />} text="Additional export formats" isDisabled />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Link href="/signup" className="w-full">
              <Button className="w-full" variant="outline">
                Get Started <FaArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <div className="mt-4 text-center text-sm text-gray-500">
              No credit card required
            </div>
          </CardFooter>
        </Card>

        {/* Premium Tier */}
        <Card className="border-2 border-blue-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-700 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
            MOST POPULAR
          </div>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription className="mt-1.5">For serious job seekers</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  ${billingCycle === "monthly" ? "9.99" : yearlyPrice.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">per {billingCycle === "monthly" ? "month" : "year"}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <FeatureItem icon={<FaFileAlt />} text="Unlimited resume customizations" isPremium />
              <FeatureItem icon={<FaGithub />} text="Advanced GitHub integration" isPremium />
              <FeatureItem icon={<FaDownload />} text="Standard export formats (PDF, DOCX)" isPremium />
              <FeatureItem icon={<FaHeadset />} text="Priority support" isPremium />
              <FeatureItem icon={<FaChartLine />} text="Resume performance analytics" isPremium />
              <FeatureItem icon={<FaDownload />} text="Additional export formats (LaTeX, HTML, JSON)" isPremium />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Link href="/signup/premium" className="w-full">
              <Button className="w-full bg-blue-700 hover:bg-blue-800">
                Get Premium <FaArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <div className="mt-4 text-center text-sm text-gray-500">
              7-day money-back guarantee
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Feature Comparison */}
      <div className="mt-20 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
        
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="limits">Limitations & Quotas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="mt-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-t border-b text-left">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 w-1/3">Feature</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 w-1/3">Free</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 w-1/3">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <FeatureRow 
                    feature="Resume customizations" 
                    free="3 per month" 
                    premium="Unlimited" 
                  />
                  <FeatureRow 
                    feature="GitHub integration" 
                    free="Basic repository access" 
                    premium="Advanced project analysis" 
                  />
                  <FeatureRow 
                    feature="Export formats" 
                    free="PDF, DOCX" 
                    premium="PDF, DOCX, LaTeX, HTML, JSON" 
                  />
                  <FeatureRow 
                    feature="Resume templates" 
                    free="6 basic templates" 
                    premium="All templates (20+)" 
                  />
                  <FeatureRow 
                    feature="Support" 
                    free="Community support" 
                    premium="Priority email support" 
                  />
                  <FeatureRow 
                    feature="Resume analytics" 
                    free="❌" 
                    premium="✅" 
                  />
                  <FeatureRow 
                    feature="AI skill suggestions" 
                    free="Basic" 
                    premium="Advanced personalized" 
                  />
                  <FeatureRow 
                    feature="Job match scoring" 
                    free="Limited" 
                    premium="Advanced with insights" 
                  />
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="limits" className="mt-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-t border-b text-left">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 w-1/3">Limit</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 w-1/3">Free</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 w-1/3">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <FeatureRow 
                    feature="Resume versions" 
                    free="3 per resume" 
                    premium="Unlimited" 
                  />
                  <FeatureRow 
                    feature="GitHub repositories" 
                    free="5 repositories" 
                    premium="Unlimited repositories" 
                  />
                  <FeatureRow 
                    feature="File storage" 
                    free="10MB" 
                    premium="1GB" 
                  />
                  <FeatureRow 
                    feature="Resume analytics history" 
                    free="Not available" 
                    premium="90 days" 
                  />
                  <FeatureRow 
                    feature="API access" 
                    free="❌" 
                    premium="✅" 
                  />
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* FAQ */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <FaqItem 
            question="Can I cancel my subscription anytime?" 
            answer="Yes, you can cancel your Premium subscription at any time. Your Premium features will remain active until the end of your current billing cycle." 
          />
          <FaqItem 
            question="What happens to my resumes if I downgrade?" 
            answer="If you downgrade from Premium to Free, you'll keep all your existing resumes, but you'll be limited to the Free plan's features and limits going forward." 
          />
          <FaqItem 
            question="Do you offer student discounts?" 
            answer="Yes! Students can get 50% off Premium plans. Contact our support team with your valid student ID for verification." 
          />
          <FaqItem 
            question="How secure is my resume data?" 
            answer="We take security seriously. All your data is encrypted in transit and at rest. We never share your personal information with third parties without your consent." 
          />
        </div>
      </div>

      {/* CTA */}
      <div className="mt-20 bg-blue-50 rounded-xl p-8 md:p-12 max-w-5xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Ready to supercharge your job search?</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Join thousands of job seekers who have boosted their application success rate with ResumeTailor.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button variant="outline" size="lg">
              Try Free Plan
            </Button>
          </Link>
          <Link href="/signup/premium">
            <Button className="bg-blue-700 hover:bg-blue-800" size="lg">
              Get Premium
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper components
function FeatureItem({ icon, text, isPremium = false, isDisabled = false }: { icon: React.ReactNode; text: string; isPremium?: boolean; isDisabled?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`text-lg ${isPremium ? "text-blue-700" : isDisabled ? "text-gray-400" : "text-gray-600"}`}>
        {icon}
      </div>
      <span className={`${isDisabled ? "text-gray-400" : "text-gray-700"}`}>
        {text}
      </span>
      {isPremium && (
        <FaCheckCircle className="ml-auto text-blue-700" />
      )}
      {isDisabled && (
        <FaTimesCircle className="ml-auto text-gray-400" />
      )}
    </div>
  );
}

function FeatureRow({ feature, free, premium }: { feature: string; free: string; premium: string }) {
  return (
    <tr>
      <td className="px-6 py-4 text-sm text-gray-900">{feature}</td>
      <td className="px-6 py-4 text-sm text-gray-700">
        {free === "❌" ? (
          <FaTimesCircle className="text-gray-400" />
        ) : free === "✅" ? (
          <FaCheckCircle className="text-green-600" />
        ) : (
          free
        )}
      </td>
      <td className="px-6 py-4 text-sm font-medium text-blue-700">
        {premium === "❌" ? (
          <FaTimesCircle className="text-gray-400" />
        ) : premium === "✅" ? (
          <FaCheckCircle className="text-blue-700" />
        ) : (
          premium
        )}
      </td>
    </tr>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b pb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
}