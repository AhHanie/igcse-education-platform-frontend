import React from "react";
import { Typography, Stack, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Stack spacing={2} alignItems="flex-start">
      <Typography variant="h4" component="h1">
        404 - Page Not Found
      </Typography>
      <Typography variant="body1">
        The page you are looking for does not exist.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>
        Go Home
      </Button>
    </Stack>
  );
};

export default NotFoundPage;
