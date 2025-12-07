import React from "react";
import { Typography, Stack } from "@mui/material";

const AboutPage: React.FC = () => {
  return (
    <Stack spacing={2}>
      <Typography variant="h4" component="h1">
        About
      </Typography>
      <Typography variant="body1">
        This project is built with Vite, React, TypeScript, React Router,
        Zustand, and Material UI.
      </Typography>
    </Stack>
  );
};

export default AboutPage;
