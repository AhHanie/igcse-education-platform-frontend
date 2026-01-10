import React from "react";
import { Link, useLocation } from "react-router-dom";


export const SidebarLinks = (props: { routes: RoutesType[] })=> {
  const { routes } = props;

  const location = useLocation();
  // Check if the route is active
  const activeRoute = (routeName: string) => location.pathname.includes(routeName);

  const createLinks = () =>
    routes.map((route, index) => {
      if (["/admin"].includes(route.layout)) {
        const isActive = activeRoute(route.path);

        return (
          <Link key={index} to={`${route.layout}/${route.path}`}>
            <li className={`nav-item ${isActive ? "active" : ""}`}>{route.icon ? route.icon : null}{" "}{route.name}</li>
          </Link>
        );
      }
      return null;
    });

  return <>{createLinks()}</>;
};

export default SidebarLinks;
