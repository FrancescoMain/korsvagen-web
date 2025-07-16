import React from "react";
import styled from "styled-components";
import {
  Users,
  FileText,
  Image,
  TrendingUp,
  Calendar,
  Activity,
} from "lucide-react";
import { Breadcrumb } from "../components/Dashboard/Breadcrumb";

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.15s ease-in-out;

  &:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{ color: string }>`
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: ${({ color }) => color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const StatChange = styled.div<{ positive?: boolean }>`
  font-size: 0.75rem;
  color: ${({ positive }) => (positive ? "var(--success)" : "var(--error)")};
  font-weight: 500;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RecentActivity = styled.div`
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
`;

const QuickActions = styled.div`
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 0.875rem;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background-color: var(--bg-secondary);
    border-color: var(--primary);
  }
`;

const ActionIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background-color: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const ActionDescription = styled.div`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

export const DashboardHome: React.FC = () => {
  const stats = [
    {
      label: "Total Pages",
      value: "12",
      change: "+2 this month",
      positive: true,
      icon: <FileText size={20} />,
      color: "var(--primary)",
    },
    {
      label: "Media Files",
      value: "145",
      change: "+18 this week",
      positive: true,
      icon: <Image size={20} />,
      color: "var(--success)",
    },
    {
      label: "Page Views",
      value: "2,847",
      change: "+12% vs last month",
      positive: true,
      icon: <TrendingUp size={20} />,
      color: "var(--warning)",
    },
    {
      label: "Active Sessions",
      value: "23",
      change: "-5% vs yesterday",
      positive: false,
      icon: <Activity size={20} />,
      color: "var(--error)",
    },
  ];

  const recentActivity = [
    {
      icon: <FileText size={16} />,
      text: "Homepage content updated",
      time: "2 hours ago",
    },
    {
      icon: <Image size={16} />,
      text: "New media files uploaded",
      time: "4 hours ago",
    },
    {
      icon: <Users size={16} />,
      text: "User logged in",
      time: "6 hours ago",
    },
    {
      icon: <FileText size={16} />,
      text: "About page created",
      time: "1 day ago",
    },
  ];

  const quickActions = [
    {
      title: "Add New Page",
      description: "Create a new page for your website",
      icon: <FileText size={20} />,
    },
    {
      title: "Upload Media",
      description: "Add images and videos to your library",
      icon: <Image size={20} />,
    },
    {
      title: "View Analytics",
      description: "Check your website performance",
      icon: <TrendingUp size={20} />,
    },
  ];

  return (
    <DashboardContainer>
      <Breadcrumb />

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatHeader>
              <StatIcon color={stat.color}>{stat.icon}</StatIcon>
            </StatHeader>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
            <StatChange positive={stat.positive}>{stat.change}</StatChange>
          </StatCard>
        ))}
      </StatsGrid>

      <ContentGrid>
        <RecentActivity>
          <SectionTitle>Recent Activity</SectionTitle>
          {recentActivity.map((activity, index) => (
            <ActivityItem key={index}>
              <ActivityIcon>{activity.icon}</ActivityIcon>
              <ActivityContent>
                <ActivityText>{activity.text}</ActivityText>
                <ActivityTime>{activity.time}</ActivityTime>
              </ActivityContent>
            </ActivityItem>
          ))}
        </RecentActivity>

        <QuickActions>
          <SectionTitle>Quick Actions</SectionTitle>
          {quickActions.map((action, index) => (
            <ActionButton key={index}>
              <ActionIcon>{action.icon}</ActionIcon>
              <ActionContent>
                <ActionTitle>{action.title}</ActionTitle>
                <ActionDescription>{action.description}</ActionDescription>
              </ActionContent>
            </ActionButton>
          ))}
        </QuickActions>
      </ContentGrid>
    </DashboardContainer>
  );
};
