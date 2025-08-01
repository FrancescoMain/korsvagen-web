import React from "react";
import { Breadcrumb } from "../components/Dashboard/Breadcrumb";
import ReviewsManager from "../components/ReviewsManager";

export const ReviewsManagement: React.FC = () => {
  return (
    <div>
      <Breadcrumb />
      <ReviewsManager />
    </div>
  );
};