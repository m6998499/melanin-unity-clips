import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.melaninunity.clips",
  appName: "Melanin Unity Clips",
  webDir: "outputs/netlify-site",
  server: {
    androidScheme: "https"
  }
};

export default config;
