// pages/demo.tsx OR app/demo/page.tsx
import React from 'react';

const DemoPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 max-w-screen-lg"> {/* Centered, padded container */}
      <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Explore Our Demo</h1>

      <div className="bg-white p-8 rounded-lg shadow-md text-gray-700 leading-relaxed">
        <p className="mb-4">
          Welcome to the demo page! This is where you can experience the core features
          of our product/service firsthand. Below you'll find information on how to
          get started or a live interactive demo if available.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">How the Demo Works</h2>
        <p className="mb-4">
          [Explain how the demo functions. Is it a video? An interactive sandbox?
          A guided tour? Provide clear instructions.]
        </p>
        <p className="mb-4">
          You can [mention key actions the user can take] to see [mention key benefits or features].
        </p>

        {/* Optional: Embed a video or interactive element */}
        {/*
        <div className="mt-8 aspect-video">
           <iframe
             src="[Your Demo Video Embed URL, e.g., YouTube or Vimeo embed]"
             className="w-full h-full rounded-lg"
             frameBorder="0"
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             allowFullScreen
           ></iframe>
        </div>
        */}

        {/* Optional: Link to a demo signup or contact */}
        {/*
        <div className="text-center mt-12">
          <a
            href="/contact" // or your signup page URL
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            Request a Personalized Demo
          </a>
        </div>
        */}

        <p className="mt-8 text-sm text-gray-500">
          Note: This is a demonstration environment and may not reflect the full capabilities
          or performance of the live product.
        </p>
      </div>
    </div>
  );
};

export default DemoPage;