"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BookDemoFormProps {
  children: React.ReactNode;
}

export function BookDemoForm({ children }: BookDemoFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    aiSearchEngines: "",
    enterprisePlan: "",
    budget: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Integrate with your backend API
    // Example API integration:
    /*
    try {
      const response = await fetch('/api/book-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const result = await response.json();
      alert('Thank you for your interest! We\'ll get back to you soon.');

      // Reset form and close dialog
      setFormData({
        name: "",
        companyName: "",
        aiSearchEngines: "",
        enterprisePlan: "",
        budget: "",
      });
      setOpen(false);
    } catch (error) {
      console.error('Form submission error:', error);
      alert('There was an error submitting the form. Please try again.');
    }
    */

    // For now, just log and show alert (remove this when you add API integration)
    console.log("Form submitted:", formData);
    alert("Thank you for your interest! We'll get back to you soon.");

    // Reset form and close dialog
    setFormData({
      name: "",
      companyName: "",
      aiSearchEngines: "",
      enterprisePlan: "",
      budget: "",
    });
    setOpen(false);
  };

  const isFormValid =
    formData.name &&
    formData.companyName &&
    formData.aiSearchEngines &&
    formData.enterprisePlan &&
    formData.budget;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book a Demo</DialogTitle>
          <DialogDescription>
            Fill out the form below and we'll get back to you shortly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          {/* Company Name Field */}
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Company Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              placeholder="Acme Inc."
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              required
            />
          </div>

          {/* AI Search Engines Question */}
          <div className="space-y-3">
            <Label>
              Are you looking to increase revenue and pipeline from AI Search
              Engines like ChatGPT? <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={formData.aiSearchEngines}
              onValueChange={(value) =>
                setFormData({ ...formData, aiSearchEngines: value })
              }
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="ai-yes" />
                <Label htmlFor="ai-yes" className="font-normal cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="ai-no" />
                <Label htmlFor="ai-no" className="font-normal cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Enterprise Plan Question */}
          <div className="space-y-3">
            <Label>
              Are you looking for an enterprise plan?{" "}
              <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={formData.enterprisePlan}
              onValueChange={(value) =>
                setFormData({ ...formData, enterprisePlan: value })
              }
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="enterprise-yes" />
                <Label
                  htmlFor="enterprise-yes"
                  className="font-normal cursor-pointer"
                >
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="enterprise-no" />
                <Label
                  htmlFor="enterprise-no"
                  className="font-normal cursor-pointer"
                >
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Budget Question */}
          <div className="space-y-3">
            <Label>
              Do you have a budget of at least $1.5K / month for an enterprise
              plan? <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={formData.budget}
              onValueChange={(value) =>
                setFormData({ ...formData, budget: value })
              }
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="budget-yes" />
                <Label
                  htmlFor="budget-yes"
                  className="font-normal cursor-pointer"
                >
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="budget-no" />
                <Label
                  htmlFor="budget-no"
                  className="font-normal cursor-pointer"
                >
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid} className="flex-1">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
