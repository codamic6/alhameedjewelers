'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const steps = [
  { id: 1, name: 'Shipping' },
  { id: 2, name: 'Payment' },
  { id: 3, name: 'Summary' },
];

export default function CheckoutSteps({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Progress">
      <div className="relative">
        {/* Background line */}
        <div className="absolute left-0 top-3.5 h-0.5 w-full bg-border" aria-hidden="true" />
        
        {/* Progress line */}
        <div
          className="absolute left-0 top-3.5 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          aria-hidden="true"
        />

        {/* Steps */}
        <ol role="list" className="relative flex w-full justify-between">
          {steps.map((step) => (
            <li key={step.name} className="relative flex flex-col items-center justify-start text-center">
              <div className="flex h-8 w-8 items-center">
                {step.id < currentStep ? (
                  // Completed step
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary z-10">
                    <Check className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                  </div>
                ) : step.id === currentStep ? (
                  // Current step
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-secondary z-10" aria-current="step">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                  </div>
                ) : (
                  // Upcoming step
                  <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-secondary z-10">
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                  </div>
                )}
              </div>
               <p className={cn("mt-2 text-sm font-medium", step.id <= currentStep ? "text-primary" : "text-muted-foreground")}>{step.name}</p>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
