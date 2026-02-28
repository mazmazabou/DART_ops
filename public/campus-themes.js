/* ── Campus Themes for Demo Mode ──
   Client-side theme definitions for multi-campus demo switching.
   Stored in sessionStorage as 'ro-demo-campus'. */

var CAMPUS_THEMES = {
  usc: {
    orgName: 'USC DART',
    orgShortName: 'DART',
    orgTagline: 'Disabled Access to Road Transportation',
    orgInitials: 'DT',
    primaryColor: '#990000',
    secondaryColor: '#FFCC00',
    sidebarBg: '#1A0000',
    sidebarText: '#C4A3A3',
    sidebarActiveBg: 'rgba(153,0,0,0.25)',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    mapUrl: 'https://maps.usc.edu/',
    campusKey: 'usc'
  },
  stanford: {
    orgName: 'Stanford ATS',
    orgShortName: 'ATS',
    orgTagline: 'Accessible Transportation Service',
    orgInitials: 'AT',
    primaryColor: '#8C1515',
    secondaryColor: '#B6B1A9',
    sidebarBg: '#1A0505',
    sidebarText: '#C4A8A8',
    sidebarActiveBg: 'rgba(140,21,21,0.25)',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    mapUrl: 'https://campus-map.stanford.edu/',
    campusKey: 'stanford'
  },
  ucla: {
    orgName: 'UCLA BruinAccess',
    orgShortName: 'BruinAccess',
    orgTagline: 'Accessible Campus Transportation',
    orgInitials: 'BA',
    primaryColor: '#2774AE',
    secondaryColor: '#FFD100',
    sidebarBg: '#0D1B2A',
    sidebarText: '#8FAFC8',
    sidebarActiveBg: 'rgba(39,116,174,0.25)',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    mapUrl: 'https://map.ucla.edu/',
    campusKey: 'ucla'
  },
  uci: {
    orgName: 'UCI AnteaterExpress',
    orgShortName: 'AntExpress',
    orgTagline: 'Accessible Campus Transportation',
    orgInitials: 'AE',
    primaryColor: '#0064A4',
    secondaryColor: '#FFD200',
    sidebarBg: '#001A2E',
    sidebarText: '#7BAAC4',
    sidebarActiveBg: 'rgba(0,100,164,0.25)',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    mapUrl: 'https://map.uci.edu/',
    campusKey: 'uci'
  }
};
