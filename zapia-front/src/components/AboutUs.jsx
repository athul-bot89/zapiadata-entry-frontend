import React from 'react';

const AboutUs = () => {
  const teamMembers = [
    {
      name: 'Kokul Jose',
      role: 'CEO & Founder',
      image: null,
      bio: 'Leading Zapia with a vision for secure and innovative financial solutions.'
    },
    {
      name: 'Athul Rameshan',
      role: 'CTO',
      image: null,
      bio: 'Building cutting-edge technology to make payments seamless and secure.'
    },
    {
      name: 'Midhun Sasi',
      role: 'Head of Security',
      image: null,
      bio: 'Ensuring your financial data is protected with industry-leading security measures.'
    },
    {
      name: 'Sree Vidya Tycoon',
      role: 'Head of Customer Success',
      image: null,
      bio: 'Dedicated to providing exceptional support and service to all our users.'
    },
    
  ];

  const features = [
    {
      icon: '🔒',
      title: 'Bank-Level Security',
      description: 'Your data is encrypted with 256-bit encryption and secured with multi-factor authentication.'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Process payments and manage your cards instantly with our optimized platform.'
    },
    {
      icon: '🌍',
      title: 'Global Coverage',
      description: 'Use your cards anywhere in the world with support for multiple currencies.'
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Access your account from any device, anywhere, anytime.'
    },
    {
      icon: '🎯',
      title: 'Smart Analytics',
      description: 'Track your spending patterns and get insights to manage your finances better.'
    },
    {
      icon: '🤝',
      title: '24/7 Support',
      description: 'Our dedicated support team is always here to help you with any questions.'
    }
  ];

  const stats = [
    { value: '1M+', label: 'Active Users' },
    { value: '50+', label: 'Countries' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-xl p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">About Zapia</h1>
          <p className="text-xl opacity-95">
            Your trusted partner in digital payment solutions
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Our Mission</h2>
          <p className="text-lg text-gray-600 text-center leading-relaxed">
            At Zapia, we're revolutionizing the way people manage their finances and make payments. 
            Our mission is to provide a secure, seamless, and intelligent platform that empowers 
            individuals and businesses to take control of their financial future. We believe in 
            making financial services accessible, transparent, and user-friendly for everyone.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Zapia by Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Why Choose Zapia?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full overflow-hidden">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
              <p className="text-sm text-blue-600 mb-2">{member.role}</p>
              <p className="text-sm text-gray-600">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Security First</h3>
            <p className="text-gray-600">
              We prioritize the security of your data and transactions above everything else.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Trust & Transparency</h3>
            <p className="text-gray-600">
              We believe in building trust through transparency in all our operations.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Innovation</h3>
            <p className="text-gray-600">
              We continuously innovate to provide you with the best financial solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Get in Touch</h2>
          <p className="text-lg text-gray-600 mb-8">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">📧</div>
              <h3 className="font-semibold text-gray-800 mb-1">Email Us</h3>
              <p className="text-sm text-gray-600">support@zapia.com</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">📞</div>
              <h3 className="font-semibold text-gray-800 mb-1">Call Us</h3>
              <p className="text-sm text-gray-600">1-800-ZAPIA-00</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl mb-2">💬</div>
              <h3 className="font-semibold text-gray-800 mb-1">Live Chat</h3>
              <p className="text-sm text-gray-600">Available 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div className="text-center py-8">
        <p className="text-gray-600">
          © 2024 Zapia. All rights reserved. Building the future of payments.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;