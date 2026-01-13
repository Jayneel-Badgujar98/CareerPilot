import React from "react";

const MainLayout = async ({ children }) => {
  return <div className="container mx-auto mt-20 mb-16">{children}</div>;
};

export default MainLayout;
