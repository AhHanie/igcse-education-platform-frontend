
// Admin Imports
import HomePage from "../src/pages/HomePage";
import ExamsPage from "../src/pages/ExamsPage";

// Auth Imports
import LoginPage from "../src/pages/LoginPage";
import SignupPage from "../src/pages/SignupPage";
import NotFoundPage from "../src/pages/NotFoundPage";
import AiStadyPage from "./pages/AiStadyPage";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "dashboard",
    icon: "📊",
    component: <HomePage />,
  },
  {
    name: "AI Tools",
    layout: "/admin",
    path: "aitools",
    icon: "🤖",
    component: <ExamsPage />,
    secondary: true,
  },
  {
    name: "Subjects",
    layout: "/admin",
    path: "subjects",
    icon: "📚",
    component: <ExamsPage />,
    secondary: true,
  },
  {
    name: "Exams",
    layout: "/admin",
    path: "exams",
    icon: "📝",
    component: <ExamsPage />,
    secondary: true,
  },
    {
    name: "Progress",
    layout: "/admin",
    path: "progress",
    icon: "📈",
    component: <ExamsPage />,
    secondary: true,
  },
 {
    name: "Ai Study",
    layout: "/admin",
    path: "ai-study",
    icon: "🤖",
    component: <AiStadyPage />,
    secondary: true,
  },


// Auth routes
  {
    name: "Sign In",
    layout: "/auth",
    path: "sign-in",
    component: <LoginPage />,
  },
  {
    name: "Sign Up",
    layout: "/auth",
    path: "sign-up",
    component: <SignupPage />,
  },
  {
    name: "Not Found",
    layout: "/auth",
    path: "not-found",
    component: <NotFoundPage />,
  },
];
export default routes;
