declare module "react-instagram-feed" {
  import { ComponentType } from "react";

  interface InstagramFeedProps {
    username: string;
    className?: string;
    classNameLoading?: string;
    limit?: number;
    noCache?: boolean;
    resolution?: "thumbnail" | "low_resolution" | "standard_resolution";
  }

  const InstagramFeed: ComponentType<InstagramFeedProps>;
  export default InstagramFeed;
}
