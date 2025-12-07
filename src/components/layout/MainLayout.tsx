import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}
          >
            My Vite React App
          </Typography>
          <Typography
            component={RouterLink}
            to="/about"
            sx={{ color: "inherit", textDecoration: "none", ml: 2 }}
          >
            About
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ flex: 1, py: 3 }}>{children}</Container>

      <Box component="footer" sx={{ py: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} My App
        </Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;
