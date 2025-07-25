import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import useAdminTranslation from "@/hooks/useAdminTranslation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Calendar,
  Activity,
  Flag
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  flaggedListings: number;
  totalCategories: number;
  totalRevenue: number;
  newUsersToday: number;
  newListingsToday: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  descriptionAm: string;
  userId: string;
  userName?: string;
  listingId?: number;
  listingTitle?: string;
  createdAt: string;
  severity: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  flaggedContent: any[];
}

export function AdminDashboard() {
  const { language } = useLanguage();
  const { t } = useAdminTranslation();

  const { data: dashboardData, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/admin/dashboard'],
    retry: false,
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t("admin.dashboard.error")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {t("admin.dashboard.errorMessage")}
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = dashboardData?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    flaggedListings: 0,
    totalCategories: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    newListingsToday: 0
  };

  const statCards = [
    {
      title: t("admin.dashboard.totalUsers"),
      titleAm: "ጠቅላላ ተጠቃሚዎች",
      value: stats.totalUsers,
      change: `+${stats.newUsersToday} ${t("admin.dashboard.today")}`,
      changeAm: `+${stats.newUsersToday} ዛሬ`,
      icon: Users,
      color: "blue"
    },
    {
      title: t("admin.dashboard.totalListings"),
      titleAm: "ጠቅላላ ማስታወቂያዎች",
      value: stats.totalListings,
      change: `+${stats.newListingsToday} ${t("admin.dashboard.today")}`,
      changeAm: `+${stats.newListingsToday} ዛሬ`,
      icon: FileText,
      color: "green"
    },
    {
      title: t("admin.dashboard.activeListings"),
      titleAm: "ንቁ ማስታወቂያዎች",
      value: stats.activeListings,
      change: `${stats.pendingListings} ${t("admin.dashboard.pending")}`,
      changeAm: `${stats.pendingListings} በመጠባበቅ ላይ`,
      icon: TrendingUp,
      color: "purple"
    },
    {
      title: t("admin.dashboard.flaggedContent"),
      titleAm: "የተሰየሙ ይዘቶች",
      value: stats.flaggedListings,
      change: t("admin.dashboard.needsReview"),
      changeAm: "ግምገማ ያስፈልጋል",
      icon: Flag,
      color: "red"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'am' ? 'እንኳን ወደ አድሚን ዳሽቦርድ በደህና መጡ' : t("admin.dashboard.welcome")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'am' ? 'የድርጅትዎን የተመዝገቡ እና ማስታወቂያ ክንውኖች ይከታተሉ' : t("admin.dashboard.subtitle")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {language === 'am' ? stat.titleAm : stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {language === 'am' ? stat.changeAm : stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>{language === 'am' ? 'የቅርብ ጊዜ እንቅስቃሴዎች' : t("admin.dashboard.recentActivity")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData?.recentActivities?.length > 0 ? (
                dashboardData.recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`
                      w-2 h-2 rounded-full mt-2 flex-shrink-0
                      ${activity.severity === 'error' ? 'bg-red-500' : 
                        activity.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}
                    `} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {language === 'am' ? activity.descriptionAm : activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{language === 'am' ? 'ምንም የቅርብ ጊዜ እንቅስቃሴ የለም' : t("admin.dashboard.noActivity")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'am' ? 'ፈጣን እርምጃዎች' : t("admin.dashboard.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                {language === 'am' ? 'ተጠቃሚዎችን ይቆጣጠሩ' : t("admin.dashboard.manageUsers")}
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                {language === 'am' ? 'ማስታወቂያዎችን ይገምግሙ' : t("admin.dashboard.reviewListings")}
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Flag className="h-4 w-4 mr-2" />
                {language === 'am' ? 'የተሰየሙ ይዘቶችን ይመልከቱ' : t("admin.dashboard.viewFlagged")}
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                {language === 'am' ? 'ሪፖርቶችን ይመልከቱ' : t("admin.dashboard.viewReports")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'am' ? 'የስርዓት ሁኔታ' : t("admin.dashboard.systemStatus")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {language === 'am' ? 'ዳታቤዝ' : t("admin.dashboard.database")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'am' ? 'ጤናማ' : t("admin.dashboard.healthy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {language === 'am' ? 'ኤፒአይ' : t("admin.dashboard.api")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'am' ? 'ጤናማ' : t("admin.dashboard.healthy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {language === 'am' ? 'ማከማቻ' : t("admin.dashboard.storage")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'am' ? 'ጤናማ' : t("admin.dashboard.healthy")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;