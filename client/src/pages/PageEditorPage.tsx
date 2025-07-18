import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageEditor } from "../components/Editor";

const PageEditorPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();

  return <PageEditor pageId={pageId} />;
};

export default PageEditorPage;
