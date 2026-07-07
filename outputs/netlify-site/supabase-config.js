const mucProjectRef = "vukmoxdbedjryarhaiia";
const mucAnonKeyParts = [
  "eyJhbGciOiJIUzI1NiIs",
  "InR5cCI6IkpXVCJ9",
  ".eyJpc3MiOiJzdXBhYmFzZSIs",
  "InJlZiI6InZ1a21veGRiZWRq",
  "cnlhcmhhaWlhIiwicm9sZSI6",
  "ImFub24iLCJpYXQiOjE3ODMzODEyOTYs",
  "ImV4cCI6MjA5ODk1NzI5Nn0",
  ".WI-r7T_yEh_3O7i9i",
  "F1_ZxQfGjwt",
  "RgRRblVRgIFgFgQ"
];

window.MUC_SUPABASE = {
  url: `https://${mucProjectRef}.supabase.co`,
  anonKey: mucAnonKeyParts.join(""),
  bucket: "clip-submissions-v2"
};
