// pages/terms-of-service.tsx OR app/terms-of-service/page.tsx
import React from 'react';

const TermsOfServicePage = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-screen-md"> {/* Centered, padded, limited width */}
      <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Terms of Service</h1>

      {/* IMPORTANT: REPLACE THIS DIV's CONTENT WITH YOUR ACTUAL TERMS OF SERVICE */}
      <div className="text-gray-700 leading-relaxed bg-white p-8 rounded-lg shadow-md">
        <p className="mb-4">
          These Terms of Service were last updated on [Date].
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Agreement to Terms</h2>
        <p className="mb-4">
          By accessing or using our website [Your Website Name] (the "Service"), you agree
          to be bound by these Terms of Service. If you disagree with any part of the terms,
          then you may not access the Service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Accounts</h2>
        <p className="mb-4">
          When you create an account with us, you must provide us information that is accurate,
          complete, and current at all times. Failure to do so constitutes a breach of the Terms,
          which may result in immediate termination of your account on our Service.
        </p>
        <p className="mb-4">
          You are responsible for safeguarding the password that you use to access the Service
          and for any activities or actions under your password.
        </p>

        {/* Add more sections relevant to your service: */}
        {/* - Intellectual Property */}
        {/* - Links To Other Web Sites */}
        {/* - Termination */}
        {/* - Limitation Of Liability */}
        {/* - Disclaimer */}
        {/* - Governing Law */}
        {/* - Changes */}
        {/* - Contact Us */}

        {/* <p className="mt-8 text-sm text-red-600 font-bold">
          Disclaimer: This is placeholder text. You must replace it with a legally reviewed
          and compliant Terms of Service agreement specific to your website and operations.
          Consult with a legal professional.
        </p> */}
      </div>
      {/* END OF PLACEHOLDER CONTENT */}
    </div>
  );
};

export default TermsOfServicePage;