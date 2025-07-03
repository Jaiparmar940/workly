import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const { width: screenWidth } = Dimensions.get('window');

interface SkillBubble {
  id: string;
  name: string;
  category: string;
  level: 'general' | 'specific' | 'detailed';
  parentId?: string;
}

interface SkillBubbleDiscoveryProps {
  onComplete: (selectedSkills: string[]) => void;
  onSkip: () => void;
}

export const SKILL_DATA: SkillBubble[] = [
  // ────────────────────────────────────────────
  // Level 1 (General) – existing categories
  // ────────────────────────────────────────────
  { id: 'home',            name: 'Home Help',                        category: 'Gig', level: 'general', parentId: undefined },
  { id: 'yard',            name: 'Yard & Outdoor',                   category: 'Gig', level: 'general', parentId: undefined },
  { id: 'moving',          name: 'Moving Help',                      category: 'Gig', level: 'general', parentId: undefined },
  { id: 'pet',             name: 'Pet Care',                         category: 'Gig', level: 'general', parentId: undefined },
  { id: 'errands',         name: 'Errands & Delivery',               category: 'Gig', level: 'general', parentId: undefined },
  { id: 'auto',            name: 'Auto Care',                        category: 'Gig', level: 'general', parentId: undefined },
  { id: 'tech',            name: 'Basic Tech Help',                  category: 'Gig', level: 'general', parentId: undefined },
  { id: 'handyman',        name: 'Handyman & Repairs',               category: 'Gig', level: 'general', parentId: undefined },
  { id: 'creative',        name: 'Creative & Digital',               category: 'Gig', level: 'general', parentId: undefined },
  { id: 'admin',           name: 'Administrative & Office Support',  category: 'Gig', level: 'general', parentId: undefined },
  { id: 'event',           name: 'Event Support',                    category: 'Gig', level: 'general', parentId: undefined },

  // ────────────────────────────────────────────
  // Level 1 (General) – NEW categories
  // ────────────────────────────────────────────
  { id: 'personalCare',    name: 'Personal Care (Non-medical)',      category: 'Gig', level: 'general', parentId: undefined },
  { id: 'transport',       name: 'Transport & Driving',              category: 'Gig', level: 'general', parentId: undefined },
  { id: 'landscaping',     name: 'Landscaping & Gardening',          category: 'Gig', level: 'general', parentId: undefined },
  { id: 'techDev',         name: 'Tech Development',                 category: 'Gig', level: 'general', parentId: undefined },
  { id: 'writing',         name: 'Writing & Editing',                category: 'Gig', level: 'general', parentId: undefined },
  { id: 'tutoring',        name: 'Tutoring & Education',             category: 'Gig', level: 'general', parentId: undefined },
  { id: 'photography',     name: 'Photography & Media',              category: 'Gig', level: 'general', parentId: undefined },
  { id: 'marketing',       name: 'Marketing & Social Media',         category: 'Gig', level: 'general', parentId: undefined },
  { id: 'finance',         name: 'Finance & Bookkeeping',            category: 'Gig', level: 'general', parentId: undefined },
  { id: 'logistics',       name: 'Logistics & Shipping',             category: 'Gig', level: 'general', parentId: undefined },
  { id: 'personalAsst',    name: 'Personal Assistance',              category: 'Gig', level: 'general', parentId: undefined },
  

    // ────────────────────────────────────────────
    // Level 2 (Specific) – original "Home Help" sub-skills
    // ────────────────────────────────────────────
    { id: 'cleaning',    name: 'House Cleaning',                 category: 'Gig', level: 'specific', parentId: 'home' },
    { id: 'laundry',     name: 'Laundry',                        category: 'Gig', level: 'specific', parentId: 'home' },
    { id: 'organizing',  name: 'Home Organizing',                category: 'Gig', level: 'specific', parentId: 'home' },
    { id: 'babysitting', name: 'Babysitting',                    category: 'Gig', level: 'specific', parentId: 'home' },
    { id: 'eldercare',   name: 'Elder Care',                     category: 'Gig', level: 'specific', parentId: 'home' },
    { id: 'deepclean',   name: 'Deep Cleaning',                  category: 'Gig', level: 'specific', parentId: 'cleaning' },
    { id: 'window',      name: 'Window Cleaning',                category: 'Gig', level: 'specific', parentId: 'cleaning' },
  
    // ────────────────────────────────────────────
    // Level 2 (Specific) – original "Yard & Outdoor"
    // ────────────────────────────────────────────
    { id: 'yardwork',    name: 'Yard Work',                      category: 'Gig', level: 'specific', parentId: 'yard' },
    { id: 'mowing',      name: 'Lawn Mowing',                    category: 'Gig', level: 'specific', parentId: 'yardwork' },
    { id: 'weeding',     name: 'Weeding',                        category: 'Gig', level: 'specific', parentId: 'yardwork' },
    { id: 'trimming',    name: 'Hedge Trimming',                 category: 'Gig', level: 'specific', parentId: 'yardwork' },
    { id: 'snow',        name: 'Snow Removal',                   category: 'Gig', level: 'specific', parentId: 'yard' },
    { id: 'pool',        name: 'Pool Cleaning',                  category: 'Gig', level: 'specific', parentId: 'yard' },
  
    // ────────────────────────────────────────────
    // Level 2 (Specific) – original "Moving Help"
    // ────────────────────────────────────────────
    { id: 'movingboxes', name: 'Box Packing',                    category: 'Gig', level: 'specific', parentId: 'moving' },
    { id: 'furniture',   name: 'Furniture Assembly',             category: 'Gig', level: 'specific', parentId: 'moving' },
    { id: 'lifting',     name: 'Heavy Lifting',                  category: 'Gig', level: 'specific', parentId: 'moving' },
  
    // ────────────────────────────────────────────
    // Level 2 (Specific) – original "Pet Care"
    // ────────────────────────────────────────────
    { id: 'dogwalking',  name: 'Dog Walking',                    category: 'Gig', level: 'specific', parentId: 'pet' },
    { id: 'petfeeding',  name: 'Pet Feeding',                    category: 'Gig', level: 'specific', parentId: 'pet' },
    { id: 'petgrooming', name: 'Pet Grooming',                   category: 'Gig', level: 'specific', parentId: 'pet' },
  
    // ────────────────────────────────────────────
    // Level 2 (Specific) – original "Errands & Delivery"
    // ────────────────────────────────────────────
    { id: 'grocery',     name: 'Grocery Shopping',               category: 'Gig', level: 'specific', parentId: 'errands' },
    { id: 'prescription',name: 'Prescription Pickup',            category: 'Gig', level: 'specific', parentId: 'errands' },
    { id: 'fooddelivery',name: 'Food Delivery',                  category: 'Gig', level: 'specific', parentId: 'errands' },
    { id: 'rideshare',   name: 'Rideshare/Driving',              category: 'Gig', level: 'specific', parentId: 'errands' },
  
    // ────────────────────────────────────────────
    // Level 2 (Specific) – original "Auto Care"
    // ────────────────────────────────────────────
    { id: 'carwash',     name: 'Car Wash',                       category: 'Gig', level: 'specific', parentId: 'auto' },
    { id: 'oilchange',   name: 'Oil Change',                     category: 'Gig', level: 'specific', parentId: 'auto' },
    { id: 'tire',        name: 'Tire Change',                    category: 'Gig', level: 'specific', parentId: 'auto' },
  
    // ────────────────────────────────────────────
    // Level 2 (Specific) – original "Basic Tech Help"
    // ────────────────────────────────────────────
    { id: 'techsetup',   name: 'Device Setup',                   category: 'Gig', level: 'specific', parentId: 'tech' },
    { id: 'wifi',        name: 'WiFi Setup',                     category: 'Gig', level: 'specific', parentId: 'tech' },
    { id: 'printer',     name: 'Printer Setup',                  category: 'Gig', level: 'specific', parentId: 'tech' },
  
    // ────────────────────────────────────────────
    // Level 2 (Specific) – new under Handyman & Repairs
    // ────────────────────────────────────────────
    { id: 'painting',        name: 'Painting',                   category: 'Gig', level: 'specific', parentId: 'handyman' },
    { id: 'installation',    name: 'Basic Installation',         category: 'Gig', level: 'specific', parentId: 'handyman' },
    { id: 'minorRepairs',    name: 'Minor Repairs',             category: 'Gig', level: 'specific', parentId: 'handyman' },
    { id: 'assembly',        name: 'Assembly',                   category: 'Gig', level: 'specific', parentId: 'handyman' },
  
    // Level 3 (subSpecific) – under Painting
    { id: 'fencePainting',     name: 'Fence Painting',              category: 'Gig', level: 'specific', parentId: 'painting' },
    { id: 'interiorPainting',  name: 'Interior Painting',           category: 'Gig', level: 'specific', parentId: 'painting' },
    { id: 'trimPainting',      name: 'Trim Painting',               category: 'Gig', level: 'specific', parentId: 'painting' },
  
    // Level 3 – under Installation
    { id: 'shelfInstallation', name: 'Shelf Installation',          category: 'Gig', level: 'specific', parentId: 'installation' },
    { id: 'tvMounting',        name: 'TV Mounting',                 category: 'Gig', level: 'specific', parentId: 'installation' },
    { id: 'blindInstallation', name: 'Blind/Curtain Rod Installation', category: 'Gig', level: 'specific', parentId: 'installation' },
  
    // Level 3 – under Minor Repairs
    { id: 'drywallPatching',   name: 'Drywall Patching',            category: 'Gig', level: 'specific', parentId: 'minorRepairs' },
    { id: 'doorAdjustment',    name: 'Door Hinge Adjustment',       category: 'Gig', level: 'specific', parentId: 'minorRepairs' },
    { id: 'caulking',          name: 'Caulking',                    category: 'Gig', level: 'specific', parentId: 'minorRepairs' },
    { id: 'lightInstallation', name: 'Light Fixture Installation',  category: 'Gig', level: 'specific', parentId: 'minorRepairs' },
  
    // Level 3 – under Assembly
    { id: 'ikeaAssembly',      name: 'Furniture Assembly',     category: 'Gig', level: 'specific', parentId: 'assembly' },
    { id: 'toyAssembly',       name: 'Toy Assembly',                category: 'Gig', level: 'specific', parentId: 'assembly' },
    { id: 'bikeAssembly',      name: 'Bike Assembly',               category: 'Gig', level: 'specific', parentId: 'assembly' },
  
    // ────────────────────────────────────────────
    // Level 2 (Specific) – under Creative & Digital
    // ────────────────────────────────────────────
    { id: 'dataEntry',      name: 'Data Entry',                    category: 'Gig', level: 'specific', parentId: 'creative' },
    { id: 'transcription',  name: 'Transcription',                 category: 'Gig', level: 'specific', parentId: 'creative' },
    { id: 'translation',    name: 'Translation',                   category: 'Gig', level: 'specific', parentId: 'creative' },
    { id: 'graphicDesign',  name: 'Basic Graphic Design',          category: 'Gig', level: 'specific', parentId: 'creative' },
    { id: 'photoEditing',   name: 'Photo Editing',                 category: 'Gig', level: 'specific', parentId: 'creative' },
    { id: 'videoEditing',   name: 'Video Editing',                 category: 'Gig', level: 'specific', parentId: 'creative' },
    { id: 'webSetup',       name: 'Basic Website Setup',           category: 'Gig', level: 'specific', parentId: 'creative' },
    { id: 'remoteSupport',  name: 'Remote Tech Support',           category: 'Gig', level: 'specific', parentId: 'creative' },
  
    // Level 3 (subSpecific) – under Data Entry
    { id: 'spreadsheetSetup',   name: 'Spreadsheet Setup',       category: 'Gig', level: 'specific', parentId: 'dataEntry' },
    { id: 'documentFormatting', name: 'Document Formatting',     category: 'Gig', level: 'specific', parentId: 'dataEntry' },
    { id: 'presentationPrep',   name: 'Presentation Preparation',category: 'Gig', level: 'specific', parentId: 'dataEntry' },
  
    // Level 3 – under Transcription
    { id: 'audioTranscription', name: 'Audio Transcription',      category: 'Gig', level: 'specific', parentId: 'transcription' },
    { id: 'videoCaptioning',    name: 'Video Captioning',         category: 'Gig', level: 'specific', parentId: 'transcription' },
  
    // Level 3 – under Translation
    { id: 'basicTranslationES', name: 'Basic English–Spanish Translation', category: 'Gig', level: 'specific', parentId: 'translation' },
    { id: 'basicTranslationFR', name: 'Basic English–French Translation',  category: 'Gig', level: 'specific', parentId: 'translation' },
  
    // Level 3 – under Graphic Design
    { id: 'flyerDesign',        name: 'Flyer Design',            category: 'Gig', level: 'specific', parentId: 'graphicDesign' },
    { id: 'logoMockup',         name: 'Logo Mockup',             category: 'Gig', level: 'specific', parentId: 'graphicDesign' },
  
    // Level 3 – under Video Editing
    { id: 'videoTrimming',      name: 'Video Trimming',          category: 'Gig', level: 'specific', parentId: 'videoEditing' },
    { id: 'subtitleInsertion',  name: 'Subtitle Insertion',      category: 'Gig', level: 'specific', parentId: 'videoEditing' },
  
    // Level 3 – under Web Setup
    { id: 'wordpressSetup',     name: 'WordPress Setup',         category: 'Gig', level: 'specific', parentId: 'webSetup' },
    { id: 'shopifySetup',       name: 'Shopify Store Setup',     category: 'Gig', level: 'specific', parentId: 'webSetup' },
    { id: 'htmlCssTweaks',      name: 'HTML/CSS Tweaks',         category: 'Gig', level: 'specific', parentId: 'webSetup' },
  
    // ────────────────────────────────────────────
    // Level 2 (Specific) – under Administrative & Office Support
    // ────────────────────────────────────────────
    { id: 'filing',        name: 'Filing & Document Organization', category: 'Gig', level: 'specific', parentId: 'admin' },
    { id: 'meetingSetup',  name: 'Meeting Setup',                  category: 'Gig', level: 'specific', parentId: 'admin' },
    { id: 'onlineResearch',name: 'Online Research',                category: 'Gig', level: 'specific', parentId: 'admin' },
    { id: 'surveyAdmin',   name: 'Survey Administration',          category: 'Gig', level: 'specific', parentId: 'admin' },
  
    // Level 3 – under Online Research
    { id: 'marketResearch', name: 'Market Research',               category: 'Gig', level: 'specific', parentId: 'onlineResearch' },
  
    // ────────────────────────────────────────────
    // Level 2 (Specific) – under Event Support
    // ────────────────────────────────────────────
    { id: 'setupTeardown',   name: 'Setup & Teardown',             category: 'Gig', level: 'specific', parentId: 'event' },
    { id: 'onsiteAssist',    name: 'On-site Assistance',            category: 'Gig', level: 'specific', parentId: 'event' },
  
    // Level 3 – under Setup & Teardown
    { id: 'venueSetup',       name: 'Venue Setup',                  category: 'Gig', level: 'specific', parentId: 'setupTeardown' },
    { id: 'decorInstallation',name: 'Decoration Installation',      category: 'Gig', level: 'specific', parentId: 'setupTeardown' },
  
    // Level 3 – under On-site Assistance
    { id: 'ushering',         name: 'Ushering',                     category: 'Gig', level: 'specific', parentId: 'onsiteAssist' },
    { id: 'ticketScanning',   name: 'Ticket Scanning',              category: 'Gig', level: 'specific', parentId: 'onsiteAssist' },
    { id: 'registrationDesk', name: 'Registration Desk',            category: 'Gig', level: 'specific', parentId: 'onsiteAssist' },
  

  // ────────────────────────────────────────────
  // Level 2 (Specific) – Personal Care
  // ────────────────────────────────────────────
  { id: 'companionship',   name: 'Companionship',                    category: 'Gig', level: 'specific', parentId: 'personalCare' },
  { id: 'dressingAssist',  name: 'Dressing Assistance',             category: 'Gig', level: 'specific', parentId: 'personalCare' },
  { id: 'groomingAssist',  name: 'Grooming Assistance',             category: 'Gig', level: 'specific', parentId: 'personalCare' },
  { id: 'mobilityAssist',  name: 'Mobility Assistance',             category: 'Gig', level: 'specific', parentId: 'personalCare' },

  // Level 3 (subSpecific) – under Companionship
  { id: 'conversation',    name: 'Conversation & Reading Aloud',     category: 'Gig', level: 'specific', parentId: 'companionship' },
  { id: 'activityCompanion', name: 'Activity Companion (Walks/Games)',category: 'Gig', level: 'specific', parentId: 'companionship' },

  // Level 4 (micro) – under Activity Companion
  { id: 'playCards',       name: 'Play Card Games',                  category: 'Gig', level: 'specific',    parentId: 'activityCompanion' },
  { id: 'readAloud',       name: 'Read Books Aloud',                 category: 'Gig', level: 'specific',    parentId: 'activityCompanion' },

  // ────────────────────────────────────────────
  // Level 2 (Specific) – Transport & Driving
  // ────────────────────────────────────────────
  { id: 'courier',         name: 'Courier Service',                  category: 'Gig', level: 'specific', parentId: 'transport' },
  { id: 'vehicleReloc',    name: 'Vehicle Relocation',               category: 'Gig', level: 'specific', parentId: 'transport' },
  { id: 'airportRide',     name: 'Airport Transportation',           category: 'Gig', level: 'specific', parentId: 'transport' },

  // Level 3 – under Courier
  { id: 'deliverSmallPkgs',name: 'Deliver Small Packages',           category: 'Gig', level: 'specific', parentId: 'courier' },
  { id: 'expressDocs',     name: 'Express Documents',               category: 'Gig', level: 'specific', parentId: 'courier' },

  // Level 4 – micro
  { id: 'trackShipment',   name: 'Shipment Tracking Updates',        category: 'Gig', level: 'specific',    parentId: 'expressDocs' },

  // ────────────────────────────────────────────
  // Level 2 (Specific) – Landscaping & Gardening
  // ────────────────────────────────────────────
  { id: 'planting',        name: 'Planting & Transplanting',         category: 'Gig', level: 'specific', parentId: 'landscaping' },
  { id: 'mulching',        name: 'Mulching',                         category: 'Gig', level: 'specific', parentId: 'landscaping' },
  { id: 'edging',          name: 'Lawn Edging',                      category: 'Gig', level: 'specific', parentId: 'landscaping' },
  { id: 'irrigationTune',  name: 'Irrigation Check & Tune-Up',       category: 'Gig', level: 'specific', parentId: 'landscaping' },

  // Level 3 – under Planting
  { id: 'flowerBedLayout', name: 'Flower Bed Layout',               category: 'Gig', level: 'specific', parentId: 'planting' },
  { id: 'containerPlants', name: 'Container Planting',              category: 'Gig', level: 'specific', parentId: 'planting' },

  // Level 4 – micro
  { id: 'seedSowing',      name: 'Seed Sowing',                      category: 'Gig', level: 'specific',    parentId: 'flowerBedLayout' },

  // ────────────────────────────────────────────
  // Level 2 (Specific) – Tech Development
  // ────────────────────────────────────────────
  { id: 'scriptWriting',   name: 'Script Writing (Python/Batch)',    category: 'Gig', level: 'specific', parentId: 'techDev' },
  { id: 'automationSetup', name: 'Zapier/IFTTT Automations',         category: 'Gig', level: 'specific', parentId: 'techDev' },
  { id: 'cmsCustom',       name: 'CMS Customization',                category: 'Gig', level: 'specific', parentId: 'techDev' },

  // Level 3 – under Script Writing
  { id: 'fileRenameScript',name: 'File Rename Script',              category: 'Gig', level: 'specific', parentId: 'scriptWriting' },

  // Level 4 – micro
  { id: 'emailParseScript',name: 'Email Parsing Script',             category: 'Gig', level: 'specific',    parentId: 'fileRenameScript' },

  // ────────────────────────────────────────────
  // Level 2 (Specific) – Writing & Editing
  // ────────────────────────────────────────────
  { id: 'blogWriting',     name: 'Blog Writing',                    category: 'Gig', level: 'specific', parentId: 'writing' },
  { id: 'resumeWriting',   name: 'Resume & Cover Letter',           category: 'Gig', level: 'specific', parentId: 'writing' },
  { id: 'copywriting',     name: 'Sales & Ad Copywriting',          category: 'Gig', level: 'specific', parentId: 'writing' },
  { id: 'proofreading',    name: 'Proofreading & Editing',          category: 'Gig', level: 'specific', parentId: 'writing' },

  // Level 3 – under Blog Writing
  { id: 'seoBlogPost',     name: 'SEO-Optimized Blog Post',         category: 'Gig', level: 'specific', parentId: 'blogWriting' },

  // ────────────────────────────────────────────
  // Level 2 (Specific) – Tutoring & Education
  // ────────────────────────────────────────────
  { id: 'mathTutor',       name: 'Math Tutoring',                   category: 'Gig', level: 'specific', parentId: 'tutoring' },
  { id: 'langTutor',       name: 'Language Tutoring',               category: 'Gig', level: 'specific', parentId: 'tutoring' },
  { id: 'softwareTrain',   name: 'Software Training (Office)',      category: 'Gig', level: 'specific', parentId: 'tutoring' },

  // Level 3 – under Language Tutoring
  { id: 'spanishConv',     name: 'Spanish Conversation Practice',   category: 'Gig', level: 'specific', parentId: 'langTutor' },

  // ────────────────────────────────────────────
  // Level 2 (Specific) – Photography & Media
  // ────────────────────────────────────────────
  { id: 'eventPhoto',      name: 'Event Photography',               category: 'Gig', level: 'specific', parentId: 'photography' },
  { id: 'productPhoto',    name: 'Product Photography',             category: 'Gig', level: 'specific', parentId: 'photography' },
  { id: 'slideshowCreate', name: 'Photo Slideshow Creation',        category: 'Gig', level: 'specific', parentId: 'photography' },

  // ────────────────────────────────────────────
  // Level 2 (Specific) – Marketing & Social Media
  // ────────────────────────────────────────────
  { id: 'socialSched',     name: 'Social Media Scheduling',         category: 'Gig', level: 'specific', parentId: 'marketing' },
  { id: 'hashtagResearch', name: 'Hashtag & Keyword Research',     category: 'Gig', level: 'specific', parentId: 'marketing' },
  { id: 'emailCampaign',   name: 'Email Campaign Setup',            category: 'Gig', level: 'specific', parentId: 'marketing' },

  // Level 3 – under Social Media Scheduling
  { id: 'postDesign',      name: 'Post Design Templates',           category: 'Gig', level: 'specific', parentId: 'socialSched' },

  // ────────────────────────────────────────────
  // Level 2 (Specific) – Finance & Bookkeeping
  // ────────────────────────────────────────────
  { id: 'bookkeeping',     name: 'Bookkeeping Entry',               category: 'Gig', level: 'specific', parentId: 'finance' },
  { id: 'invoiceCreate',   name: 'Invoice Creation',                category: 'Gig', level: 'specific', parentId: 'finance' },
  { id: 'expenseTrack',    name: 'Expense Tracking',                category: 'Gig', level: 'specific', parentId: 'finance' },

  // ────────────────────────────────────────────
  // Level 2 (Specific) – Logistics & Shipping
  // ────────────────────────────────────────────
  { id: 'packing',         name: 'Item Packing',                    category: 'Gig', level: 'specific', parentId: 'logistics' },
  { id: 'labeling',        name: 'Labeling & Barcoding',            category: 'Gig', level: 'specific', parentId: 'logistics' },
  { id: 'pickupCoord',     name: 'Pickup Coordination',             category: 'Gig', level: 'specific', parentId: 'logistics' },

  // ────────────────────────────────────────────
  // Level 2 (Specific) – Personal Assistance
  // ────────────────────────────────────────────
  { id: 'apptSchedule',    name: 'Appointment Scheduling',          category: 'Gig', level: 'specific', parentId: 'personalAsst' },
  { id: 'travelBook',      name: 'Travel Research & Booking',       category: 'Gig', level: 'specific', parentId: 'personalAsst' },
  { id: 'giftPurchase',    name: 'Gift Purchasing',                 category: 'Gig', level: 'specific', parentId: 'personalAsst' },

  // Level 3 – under Travel Research
  { id: 'flightSearch',    name: 'Flight Price Comparison',         category: 'Gig', level: 'specific', parentId: 'travelBook' },
  { id: 'hotelResearch',   name: 'Hotel Comparison',                category: 'Gig', level: 'specific', parentId: 'travelBook' },
  
  // ────────────────────────────────────────────
  // (Keep 'other' at the bottom for catch-alls)
  // ────────────────────────────────────────────
];

export default function SkillBubbleDiscovery({ onComplete, onSkip }: SkillBubbleDiscoveryProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [visibleBubbles, setVisibleBubbles] = useState<SkillBubble[]>([]);
  const [bubbleAnimations, setBubbleAnimations] = useState<{ [key: string]: Animated.Value }>({});

  // Initialize with general categories
  useEffect(() => {
    const generalBubbles = SKILL_DATA.filter(skill => skill.level === 'general');
    setVisibleBubbles(generalBubbles);
    
    // Initialize animations
    const animations: { [key: string]: Animated.Value } = {};
    generalBubbles.forEach(bubble => {
      animations[bubble.id] = new Animated.Value(0);
    });
    setBubbleAnimations(animations);
    
    // Animate bubbles in
    setTimeout(() => {
      generalBubbles.forEach(bubble => {
        Animated.spring(animations[bubble.id], {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }).start();
      });
    }, 100);
  }, []);

  const handleBubblePress = (bubble: SkillBubble) => {
    // Toggle selection
    const isSelected = selectedSkills.includes(bubble.id);
    let newSelectedSkills: string[];
    
    if (isSelected) {
      // Deselect and remove related skills
      newSelectedSkills = selectedSkills.filter(id => {
        const skill = SKILL_DATA.find(s => s.id === id);
        return id !== bubble.id && skill?.parentId !== bubble.id;
      });
      
      // Find child bubbles to remove
      const relatedSkillIds = SKILL_DATA.filter(skill => skill.parentId === bubble.id).map(s => s.id);
      const bubblesToRemove = visibleBubbles.filter(b => relatedSkillIds.includes(b.id));
      
      // Animate out the child bubbles
      bubblesToRemove.forEach(skill => {
        const animation = bubbleAnimations[skill.id];
        if (animation) {
          Animated.timing(animation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            // Remove from visible bubbles after animation
            setVisibleBubbles(prev => prev.filter(b => !relatedSkillIds.includes(b.id)));
          });
        }
      });
      
      // If no animations to wait for, remove immediately
      if (bubblesToRemove.length === 0) {
        setVisibleBubbles(prev => prev.filter(b => !relatedSkillIds.includes(b.id)));
      }
    } else {
      // Select this skill
      newSelectedSkills = [...selectedSkills, bubble.id];
      
      // Find related skills to show
      const relatedSkills = SKILL_DATA.filter(skill => 
        skill.parentId === bubble.id && !visibleBubbles.find(vb => vb.id === skill.id)
      );

      if (relatedSkills.length > 0) {
        // Find the index of the selected bubble
        const selectedIndex = visibleBubbles.findIndex(b => b.id === bubble.id);
        
        // Insert new bubbles after the selected bubble
        const newBubbles = [
          ...visibleBubbles.slice(0, selectedIndex + 1),
          ...relatedSkills,
          ...visibleBubbles.slice(selectedIndex + 1)
        ];
        
        setVisibleBubbles(newBubbles);

        // Animate new bubbles in
        relatedSkills.forEach(skill => {
          const animation = new Animated.Value(0);
          setBubbleAnimations(prev => ({ ...prev, [skill.id]: animation }));
          
          setTimeout(() => {
            Animated.spring(animation, {
              toValue: 1,
              useNativeDriver: true,
              tension: 50,
              friction: 7,
            }).start();
          }, 100);
        });
      }
    }
    
    setSelectedSkills(newSelectedSkills);
  };

  const renderBubble = (bubble: SkillBubble) => {
    const isSelected = selectedSkills.includes(bubble.id);
    const animation = bubbleAnimations[bubble.id] || new Animated.Value(1);
    
    return (
      <Animated.View
        key={bubble.id}
        style={[
          styles.bubbleContainer,
          {
            transform: [{ scale: animation }],
            opacity: animation,
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.bubble,
            {
              backgroundColor: isSelected ? colors.tint : colors.background,
              borderColor: isSelected ? colors.tint : colors.tabIconDefault,
            }
          ]}
          onPress={() => handleBubblePress(bubble)}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[
              styles.bubbleText,
              {
                color: isSelected ? 'white' : colors.text,
                fontSize: bubble.level === 'general' ? 16 : bubble.level === 'specific' ? 14 : 12,
              }
            ]}
          >
            {bubble.name}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>What are you good at?</ThemedText>
        <ThemedText style={styles.subtitle}>
          Tap on categories that interest you. We'll show you more specific options.
        </ThemedText>
      </View>

      <ScrollView 
        style={styles.bubblesContainer}
        contentContainerStyle={styles.bubblesContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bubblesGrid}>
          {visibleBubbles.map(renderBubble)}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.skipButton, { borderColor: colors.tint }]}
          onPress={onSkip}
        >
          <ThemedText style={[styles.skipButtonText, { color: colors.tint }]}>
            Skip for now
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor: selectedSkills.length > 0 ? colors.tint : colors.tabIconDefault,
            }
          ]}
          onPress={() => onComplete(selectedSkills)}
          disabled={selectedSkills.length === 0}
        >
          <ThemedText style={[styles.continueButtonText, { color: 'white' }]}>
            Continue ({selectedSkills.length})
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    alignItems: 'center',
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 5,
  },
  bubblesContainer: {
    flex: 1,
  },
  bubblesContent: {
    padding: 16,
    paddingTop: 0,
  },
  bubblesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  bubbleContainer: {
    marginBottom: 8,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    gap: 12,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
}); 