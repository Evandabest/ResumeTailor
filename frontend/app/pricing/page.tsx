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
import { CheckoutDialog } from "@/components/checkout-dialog";

export default function PricingPage() {
  const [checkoutData, setCheckoutData] = useState<{
    isOpen: boolean;
    tokenAmount: number;
    price: number;
    packageName: string;
  }>({
    isOpen: false,
    tokenAmount: 0,
    price: 0,
    packageName: "",
  });

  const handlePurchase = (amount: number, price: number, packageName: string) => {
    setCheckoutData({
      isOpen: true,
      tokenAmount: amount,
      price,
      packageName,
    });
  };

  return (
    <div className="container mx-auto py-12 px-4 md:py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Resume Generation Tokens</h1>
        <p className="mt-4 text-xl text-gray-600">
          Every user gets 10 free tokens monthly. Purchase additional tokens as needed.
        </p>
        <div className="mt-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            All features included for everyone!
          </Badge>
        </div>
      </div>

      {/* Token Package Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Basic Package */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription className="mt-1.5">50 Tokens</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">$5</div>
                <div className="text-sm text-gray-500">($0.10/token)</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Button 
              className="w-full transform transition-transform hover:scale-105 hover:shadow-lg cursor-pointer"
              onClick={() => handlePurchase(50, 5, "Starter")}
            >
              Purchase Tokens
            </Button>
          </CardContent>
        </Card>

        {/* Value Package */}
        <Card className="border-2 border-blue-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-700 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
            BEST VALUE
          </div>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Value</CardTitle>
                <CardDescription className="mt-1.5">120 Tokens</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">$10</div>
                <div className="text-sm text-gray-500">($0.083/token)</div>
                <div className="text-xs text-green-600">Save 17% vs Starter</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Button 
              className="w-full bg-blue-700 hover:bg-blue-800 transform transition-transform hover:scale-105 hover:shadow-lg cursor-pointer"
              onClick={() => handlePurchase(120, 10, "Value")}
            >
              Purchase Tokens
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Package */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Bulk</CardTitle>
                <CardDescription className="mt-1.5">240 Tokens</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">$20</div>
                <div className="text-sm text-gray-500">($0.083/token)</div>
                <div className="text-xs text-green-600">Save 25% vs Starter</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Button 
              className="w-full transform transition-transform hover:scale-105 hover:shadow-lg cursor-pointer"
              onClick={() => handlePurchase(240, 20, "Bulk")}
            >
              Purchase Tokens
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Included */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Features Included For Everyone</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <FeatureItem icon={<FaGithub />} text="Advanced GitHub integration" isPremium />
          <FeatureItem icon={<FaDownload />} text="All export formats (PDF, DOCX, LaTeX)" isPremium />
          <FeatureItem icon={<FaChartLine />} text="Resume performance analytics" isPremium />
          <FeatureItem icon={<FaHeadset />} text="Priority support" isPremium />
        </div>
      </div>

      {/* Updated FAQ */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <FaqItem 
            question="How do tokens work?" 
            answer="Each resume generation uses one token. All users get 10 free tokens monthly. Additional tokens can be purchased in packages and never expire." 
          />
          <FaqItem 
            question="Do tokens expire?" 
            answer="No, purchased tokens never expire. Your 10 monthly free tokens reset each month if unused." 
          />
          <FaqItem 
            question="Can I share tokens?" 
            answer="Tokens are linked to your account and cannot be transferred between users." 
          />
        </div>
      </div>

      <CheckoutDialog
        isOpen={checkoutData.isOpen}
        onClose={() => setCheckoutData(prev => ({ ...prev, isOpen: false }))}
        tokenAmount={checkoutData.tokenAmount}
        price={checkoutData.price}
        packageName={checkoutData.packageName}
      />
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