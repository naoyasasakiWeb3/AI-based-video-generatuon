
import React from 'react';
import { GenerationStep } from '../types';

interface StepIndicatorProps {
    currentStep: GenerationStep;
}

const STEPS = [
    { id: GenerationStep.FindingTrend, label: 'Finding Trend' },
    { id: GenerationStep.WritingStory, label: 'Writing Story' },
    { id: GenerationStep.GeneratingImages, label: 'Generating Images' },
    { id: GenerationStep.GeneratingVideo1, label: 'Creating Video 1/2' },
    { id: GenerationStep.GeneratingVideo2, label: 'Creating Video 2/2' },
    { id: GenerationStep.Done, label: 'Complete' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
    if (currentStep === GenerationStep.Idle) {
        return null;
    }

    const currentStepIndex = STEPS.findIndex(step => step.id === currentStep);

    return (
        <div className="my-8">
            <div className="flex items-center justify-between">
                {STEPS.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;

                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                        ${isCompleted ? 'bg-green-500 border-green-500' : ''}
                                        ${isActive ? 'bg-purple-500 border-purple-500 animate-pulse' : ''}
                                        ${!isCompleted && !isActive ? 'bg-gray-700 border-gray-600' : ''}
                                    `}
                                >
                                    {isCompleted ? (
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    ) : (
                                        <span className={`${isActive ? 'text-white' : 'text-gray-400'}`}>{index + 1}</span>
                                    )}
                                </div>
                                <p className={`mt-2 text-xs sm:text-sm transition-colors duration-300 ${isActive || isCompleted ? 'text-white' : 'text-gray-500'}`}>
                                    {step.label}
                                </p>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div className={`flex-auto border-t-2 transition-colors duration-500 mx-2 ${isCompleted ? 'border-green-500' : 'border-gray-600'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default StepIndicator;
