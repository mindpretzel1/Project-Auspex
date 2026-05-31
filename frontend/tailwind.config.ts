import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        auspex: {
          ink: "#14213d",
          graphite: "#27313f",
          mist: "#f5f7fb",
          teal: "#0f766e",
          amber: "#b45309",
          red: "#b91c1c",
        },
      },
      boxShadow: {
        panel: "0 18px 44px rgba(20, 33, 61, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
