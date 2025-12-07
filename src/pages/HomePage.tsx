import React from "react";
import { Typography, Stack } from "@mui/material";

const HomePage: React.FC = () => {
  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Home
      </Typography>
      <Typography variant="body1">
        This is the home page. Below is a simple counter implemented with
        Zustand and Material UI.
      </Typography>
    </Stack>
  );
};

export default HomePage;
