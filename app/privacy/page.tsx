// pages/privacy-policy.tsx OR app/privacy-policy/page.tsx
import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-screen-md"> {/* Centered, padded, limited width */}
      <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Privacy Policy</h1>

      {/* IMPORTANT: REPLACE THIS DIV's CONTENT WITH YOUR ACTUAL PRIVACY POLICY */}
      <div className="text-gray-700 leading-relaxed bg-white p-8 rounded-lg shadow-md">
        <p className="mb-4">
          This Privacy Policy was last updated on [Date].
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Introduction</h2>
        <p className="mb-4">
          Your privacy is important to us. This privacy policy explains how we collect, use, protect,
          and disclose your information when you use our website [Your Website Name].
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Information We Collect</h2>
        <p className="mb-4">
          We collect several types of information for various purposes to provide and improve
          our service to you.
        </p>
        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-800">Personal Data</h3>
        <p className="mb-4">
          While using our Service, we may ask you to provide us with certain personally
          identifiable information that can be used to contact or identify you ("Personal Data").
          Personally identifiable information may include, but is not limited to:
        </p>
        <ul className="list-disc ml-8 mb-4">
          <li className="mb-1">[Example: Email address]</li>
          <li className="mb-1">[Example: First name and last name]</li>
          <li className="mb-1">[Example: Phone number]</li>
          <li className="mb-1">[Example: Address, State, Province, ZIP/Postal code, City]</li>
          <li className="mb-1">[Example: Cookies and Usage Data]</li>
          {/* Add all types of personal data you collect */}
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2 text-gray-800">Usage Data</h3>
        <p className="mb-4">
          We may also collect information how the Service is accessed and used ("Usage Data").
          This Usage Data may include information such as your computer's Internet Protocol address
          (e.g. IP address), browser type, browser version, the pages of our Service that you visit,
          the time and date of your visit, the time spent on those pages, unique device identifiers
          and other diagnostic data.
        </p>
        {/* Add other types of data: Tracking & Cookies Data, etc. */}

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Use of Data</h2>
        <p className="mb-4">
           We use the collected data for various purposes:
        </p>
        <ul className="list-disc ml-8 mb-4">
          <li className="mb-1">[Example: To provide and maintain the Service]</li>
          <li className="mb-1">[Example: To notify you about changes to our Service]</li>
          {/* List all purposes for data use */}
        </ul>

        {/* Add more sections as required by law and your practices: */}
        {/* - Transfer of Data */}
        {/* - Disclosure of Data (Legal requirements, Business Transaction) */}
        {/* - Security of Data */}
        {/* - Your Data Protection Rights (e.g., GDPR, CCPA) */}
        {/* - Service Providers */}
        {/* - Links to Other Sites */}
        {/* - Children's Privacy */}
        {/* - Changes to This Privacy Policy */}
        {/* - Contact Us */}

        <p className="mt-8 text-sm text-red-600 font-bold">
          Disclaimer: This is placeholder text. You must replace it with a legally reviewed
          and compliant Privacy Policy specific to your website and data practices.
          Consult with a legal professional.
        </p>
      </div>
      {/* END OF PLACEHOLDER CONTENT */}
    </div>
  );
};

export default PrivacyPolicyPage;