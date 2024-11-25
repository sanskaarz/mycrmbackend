'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'LeadTaskSubCategories',
      [
        {
          name: 'frontenddevelopment',
          displayName: 'Front-End Development',
          leadTaskCategoryId: 1,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'backenddevelopment',
          displayName: 'Back-End Development',
          leadTaskCategoryId: 1,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'ecommercedevelopment',
          displayName: 'E-commerce Development',
          leadTaskCategoryId: 1,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'webmaintenace',
          displayName: 'Website Maintenance',
          leadTaskCategoryId: 1,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'nativeappdevelopment',
          displayName: 'Native App Development',
          leadTaskCategoryId: 2,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'crossplatformappdevelopment',
          displayName: 'Cross-Platform App Development',
          leadTaskCategoryId: 2,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'appdesign&userinterface',
          displayName: 'App Design & User Interface',
          leadTaskCategoryId: 2,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'mobilebackendasaserviceintegration',
          displayName: 'Mobile Backend as a Service Integration',
          leadTaskCategoryId: 2,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'appstoreoptimization',
          displayName: 'App Store Optimization',
          leadTaskCategoryId: 2,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'databasedesign&management',
          displayName: 'Database Design & Management',
          leadTaskCategoryId: 3,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'applicationintegration&apidevelopment',
          displayName: 'Application Integration & API Development',
          leadTaskCategoryId: 3,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'softwaretesting&qualityassurance',
          displayName: 'Software Testing & Quality Assurance',
          leadTaskCategoryId: 3,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'deployment&maintenance',
          displayName: 'Deployment & Maintenance',
          leadTaskCategoryId: 3,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'customsoftwaredevelopment',
          displayName: 'Custom Software Development',
          leadTaskCategoryId: 3,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'servermanagement&virtualization',
          displayName: 'Server Management & Virtualization',
          leadTaskCategoryId: 4,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'networkdesign&implementation',
          displayName: 'Network Design & Implementation',
          leadTaskCategoryId: 4,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'cloudinfrastructureservices',
          displayName: 'Cloud Infrastructure Services',
          leadTaskCategoryId: 4,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'datacenteroperations&security',
          displayName: 'Data Center Operations & Security',
          leadTaskCategoryId: 4,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'disasterrecovery&backupsolutions',
          displayName: 'Disaster Recovery & Backup Solutions',
          leadTaskCategoryId: 4,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'firewalls&networksecurityconfiguration',
          displayName: 'Firewalls & Network Security Configuration',
          leadTaskCategoryId: 5,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'securityassessments&vulnerabilityscanning',
          displayName: 'Security Assessments & Vulnerability Scanning',
          leadTaskCategoryId: 5,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'penetrationtesting&incidentresponse',
          displayName: 'Penetration Testing & Incident Response',
          leadTaskCategoryId: 5,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'endpointsecurity&dataencryption',
          displayName: 'Endpoint Security & Data Encryption',
          leadTaskCategoryId: 5,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'securityawarenesstraining&compliance',
          displayName: 'Security Awareness Training & Compliance',
          leadTaskCategoryId: 5,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'searchengineoptimization(seo)',
          displayName: 'Search Engine Optimization (SEO)',
          leadTaskCategoryId: 6,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'contentmarketing',
          displayName: 'Content Marketing',
          leadTaskCategoryId: 6,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'socialmediamarketing&paidadvertising',
          displayName: 'Social Media Marketing & Paid Advertising',
          leadTaskCategoryId: 6,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'emailmarketing&marketingautomation',
          displayName: 'Email Marketing & Marketing Automation',
          leadTaskCategoryId: 6,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'analytics&reporting',
          displayName: 'Analytics & Reporting',
          leadTaskCategoryId: 6,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        },
        {
          name: 'conversionrateoptimization(cro)',
          displayName: 'Conversion Rate Optimization (CRO)',
          leadTaskCategoryId: 6,
          createdAt: '2024-04-11 17:40:00.000+05:30',
          updatedAt: '2024-04-11 17:40:00.000+05:30',
        }        
        
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

