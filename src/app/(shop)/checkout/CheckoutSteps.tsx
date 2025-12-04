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
        {/* Progress line */}
        <div className="absolute left-0 top-1/2 w-full -translate-y-1/2" aria-hidden="true">
            <div className="h-0.5 w-full bg-border" />
        </div>
         <div className="absolute left-0 top-1/2 w-full -translate-y-1/2" aria-hidden="true">
            <div 
                className="h-0.5 bg-primary transition-all duration-500" 
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
        </div>

        {/* Steps */}
        <ol role="list" className="relative flex justify-between">
          {steps.map((step) => (
            <li key={step.name} className="flex flex-col items-center">
              {step.id < currentStep ? (
                // Completed step
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Check className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                </div>
              ) : step.id === currentStep ? (
                // Current step
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-secondary" aria-current="step">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                </div>
              ) : (
                // Upcoming step
                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-secondary">
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                </div>
              )}
              <p className={cn("mt-2 text-sm font-medium", step.id <= currentStep ? "text-primary" : "text-muted-foreground")}>{step.name}</p>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
