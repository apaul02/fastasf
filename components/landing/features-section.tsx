import { Check, Calendar, GanttChart, Users } from "lucide-react";
import { FeatureCard } from "./feature-card";

const features = [
  {
    title: "Create, edit, delete todos",
    description: "Easily manage your tasks with simple and intuitive controls.",
    icon: <Check />,
  },
  {
    title: "Date extraction from title",
    description: "Automatically extract due dates from your todo titles.",
    icon: <Calendar />,
  },
  {
    title: "Workspaces",
    description: "Organize your todos into different workspaces.",
    icon: <GanttChart />,
  },
  {
    title: "Shared Workspaces",
    description: "Collaborate with others by sharing your workspaces.",
    icon: <Users />,
  },
];

export const FeaturesSection = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
      {features.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </section>
  );
};
