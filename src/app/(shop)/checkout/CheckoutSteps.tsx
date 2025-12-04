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
      <ol role="list" className="grid grid-cols-3 items-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn(
              'relative',
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
            )}
          >
            {step.id < currentStep ? (
              // Completed step
              <>
                <div className="absolute inset-0 top-1/2 flex items-center -translate-y-1/2" aria-hidden="true">
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Check className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                </div>
                <p className="mt-2 text-xs text-center font-medium text-primary absolute -left-1/2 right-[-50%] w-[200%] sm:relative sm:left-auto sm:right-auto sm:w-auto">{step.name}</p>
              </>
            ) : step.id === currentStep ? (
              // Current step
              <>
                <div className="absolute inset-0 top-1/2 flex items-center -translate-y-1/2" aria-hidden="true">
                  <div className={cn("h-0.5 w-full", stepIdx === 0 ? "bg-transparent" : "bg-border")} />
                </div>
                 <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-secondary" aria-current="step">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                </div>
                 <p className="mt-2 text-xs text-center font-medium text-primary absolute -left-1/2 right-[-50%] w-[200%] sm:relative sm:left-auto sm:right-auto sm:w-auto">{step.name}</p>
              </>
            ) : (
              // Upcoming step
              <>
                <div className="absolute inset-0 top-1/2 flex items-center -translate-y-1/2" aria-hidden="true">
                  <div className="h-0.5 w-full bg-border" />
                </div>
                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-secondary">
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                </div>
                 <p className="mt-2 text-xs text-center font-medium text-muted-foreground absolute -left-1/2 right-[-50%] w-[200%] sm:relative sm:left-auto sm:right-auto sm:w-auto">{step.name}</p>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
