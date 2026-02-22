// Default generic campus locations for RideOps
// Used when no tenant-specific locations file is configured
const DEFAULT_LOCATIONS = [
  { value: 'main-library', label: 'Main Library' },
  { value: 'science-library', label: 'Science Library' },
  { value: 'student-union', label: 'Student Union' },
  { value: 'student-center', label: 'Student Center' },
  { value: 'engineering-hall', label: 'Engineering Hall' },
  { value: 'science-building', label: 'Science Building' },
  { value: 'humanities-building', label: 'Humanities Building' },
  { value: 'business-school', label: 'Business School' },
  { value: 'law-school', label: 'Law School' },
  { value: 'medical-center', label: 'Medical Center' },
  { value: 'health-center', label: 'Health Center' },
  { value: 'recreation-center', label: 'Recreation Center' },
  { value: 'gymnasium', label: 'Gymnasium' },
  { value: 'performing-arts', label: 'Performing Arts Center' },
  { value: 'fine-arts', label: 'Fine Arts Building' },
  { value: 'admin-building', label: 'Administration Building' },
  { value: 'admissions-office', label: 'Admissions Office' },
  { value: 'dining-hall-north', label: 'Dining Hall (North)' },
  { value: 'dining-hall-south', label: 'Dining Hall (South)' },
  { value: 'residence-hall-a', label: 'Residence Hall A' },
  { value: 'residence-hall-b', label: 'Residence Hall B' },
  { value: 'residence-hall-c', label: 'Residence Hall C' },
  { value: 'parking-structure-a', label: 'Parking Structure A' },
  { value: 'parking-structure-b', label: 'Parking Structure B' },
  { value: 'campus-bookstore', label: 'Campus Bookstore' },
  { value: 'campus-quad', label: 'Campus Quad' },
  { value: 'stadium', label: 'Stadium' },
  { value: 'aquatic-center', label: 'Aquatic Center' },
  { value: 'transportation-hub', label: 'Transportation Hub' },
  { value: 'visitor-center', label: 'Visitor Center' },
  { value: 'campus-security', label: 'Campus Security' },
  { value: 'maintenance-facility', label: 'Maintenance Facility' },
];

if (typeof module !== 'undefined') {
  module.exports = DEFAULT_LOCATIONS;
}
