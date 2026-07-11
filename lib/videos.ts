export type VideoStatus = "draft" | "pending_review" | "published" | "rejected" | "removed";

export type Clip = {
  id: string;
  user_id: string;
  title: string;
  caption: string;
  category: string;
  creator: string;
  video_url: string;
  thumbnail_url: string;
  status: VideoStatus;
  view_count: number;
  report_count: number;
  created_at: string;
  updated_at: string;
};

export const categories = [
  "Education",
  "Motivation",
  "Lifestyle",
  "Entrepreneurship",
  "Culture",
  "Entertainment",
  "Wellness",
  "Local Business",
  "Community",
  "Comedy",
  "News Commentary",
  "Creator Content",
];

export const sampleVideos: Clip[] = [
  {
    id: "clip-001",
    user_id: "demo-uploader",
    title: "Morning Momentum",
    caption: "A quick reset for ambitious creators building something real.",
    category: "Motivation",
    creator: "Unity Studio",
    video_url: "https://videos.pexels.com/video-files/3209828/3209828-uhd_1440_2560_25fps.mp4",
    thumbnail_url: "https://images.pexels.com/photos/3769138/pexels-photo-3769138.jpeg?auto=compress&cs=tinysrgb&w=900",
    status: "published",
    view_count: 12840,
    report_count: 0,
    created_at: "2026-07-01T10:00:00Z",
    updated_at: "2026-07-01T10:00:00Z",
  },
  {
    id: "clip-002",
    user_id: "demo-uploader",
    title: "Local Flavor Spotlight",
    caption: "Celebrating neighborhood businesses, food, style, and the people behind them.",
    category: "Local Business",
    creator: "City Clips",
    video_url: "https://videos.pexels.com/video-files/3045163/3045163-uhd_1440_2560_24fps.mp4",
    thumbnail_url: "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=900",
    status: "published",
    view_count: 8720,
    report_count: 1,
    created_at: "2026-07-02T10:00:00Z",
    updated_at: "2026-07-02T10:00:00Z",
  },
  {
    id: "clip-003",
    user_id: "demo-uploader",
    title: "Wellness Walk",
    caption: "Short-form discovery for everyday ideas, calm moments, and healthy routines.",
    category: "Wellness",
    creator: "Open Circle",
    video_url: "https://videos.pexels.com/video-files/4125025/4125025-uhd_1440_2560_25fps.mp4",
    thumbnail_url: "https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=900",
    status: "published",
    view_count: 15642,
    report_count: 0,
    created_at: "2026-07-03T10:00:00Z",
    updated_at: "2026-07-03T10:00:00Z",
  },
];
