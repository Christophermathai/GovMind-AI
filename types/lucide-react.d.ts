declare module 'lucide-react' {
  import * as React from 'react';
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
  }
  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Circle: LucideIcon;
  export const FileText: LucideIcon;
  export const Home: LucideIcon;
  export const Info: LucideIcon;
  export const Loader2: LucideIcon;
  export const PlusCircle: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Scale: LucideIcon;
  export const Search: LucideIcon;
  export const Send: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Terminal: LucideIcon;
  export const Upload: LucideIcon;
  export const Users: LucideIcon;
  export const Building2: LucideIcon;
  export const Activity: LucideIcon;
  export const Zap: LucideIcon;
  export const Briefcase: LucideIcon;
  export const XCircle: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const MessageSquare: LucideIcon;

  const icons: Record<string, LucideIcon>;
  export default icons;
}
