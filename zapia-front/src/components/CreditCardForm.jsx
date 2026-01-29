import React, { useState } from 'react';
import Step1Bank from './components_card_fill/Step1Bank';
import Step2Details from './components_card_fill/Step2Details';
import Step3 from './components_card_fill/Step3';
import Step4 from './components_card_fill/Step4';

const CreditCardForm = () => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Shared form data
  const [formData, setFormData] = useState({
    bankId: "",
    bankName: "",
    // Add more fields as needed for future steps
  });

  // Navigation functions
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render step component based on current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Bank
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
          />
        );
      case 2:
        return (
          <Step2Details
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        );
      case 3:
        return (
          <Step3
            formData={formData}
            setFormData={setFormData}
            prevStep={prevStep}
            nextStep={nextStep}
          />
        );
      case 4:
        return (
          <Step4
            formData={formData}
            setFormData={setFormData}
            onPrev={prevStep}
            onNext={() => {
              // Handle completion or move to a success page
              alert('All steps completed successfully!');
              // You can add logic here to reset or redirect
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Credit Card Form
      </h2>
      
      {/* Step indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </span>
          <div className="flex space-x-2">
            {[...Array(totalSteps)].map((_, index) => (
              <div
                key={index}
                className={`h-2 w-8 rounded ${
                  index < currentStep
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Render current step */}
      {renderStep()}
    </div>
  );
};

export default CreditCardForm;