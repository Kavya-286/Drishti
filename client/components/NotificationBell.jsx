import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  X,
  ExternalLink,
} from "lucide-react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadNotifications = () => {
      try {
        const user = localStorage.getItem("currentUser");
        if (!user) return;

        const userData = JSON.parse(user);
        setCurrentUser(userData);

        // Load all notifications
        const allNotifications = JSON.parse(
          localStorage.getItem("userNotifications") || "[]",
        );

        // Filter notifications for current user (by user ID or email)
        const userNotifications = allNotifications.filter(
          (notif) =>
            notif.recipientId === userData.id ||
            notif.recipientId === userData.email,
        );

        // Sort by creation date (newest first)
        const sortedNotifications = userNotifications.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setNotifications(sortedNotifications);
        setUnreadCount(sortedNotifications.filter((n) => !n.read).length);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    loadNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (notificationId) => {
    try {
      const allNotifications = JSON.parse(
        localStorage.getItem("userNotifications") || "[]",
      );
      const updatedNotifications = allNotifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif,
      );

      localStorage.setItem(
        "userNotifications",
        JSON.stringify(updatedNotifications),
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = () => {
    try {
      const allNotifications = JSON.parse(
        localStorage.getItem("userNotifications") || "[]",
      );
      const updatedNotifications = allNotifications.map((notif) =>
        notif.recipientId === currentUser?.id ||
        notif.recipientId === currentUser?.email
          ? { ...notif, read: true }
          : notif,
      );

      localStorage.setItem(
        "userNotifications",
        JSON.stringify(updatedNotifications),
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const deleteNotification = (notificationId) => {
    try {
      const allNotifications = JSON.parse(
        localStorage.getItem("userNotifications") || "[]",
      );
      const updatedNotifications = allNotifications.filter(
        (notif) => notif.id !== notificationId,
      );

      localStorage.setItem(
        "userNotifications",
        JSON.stringify(updatedNotifications),
      );

      // Update local state
      const deletedNotif = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId),
      );
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "investment_interest":
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case "general":
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Don't show notification bell for investors
  if (!currentUser || currentUser.userType === "investor") {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <CardDescription>
                You have {unreadCount} unread notification
                {unreadCount !== 1 ? "s" : ""}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
                <p className="text-xs text-muted-foreground">
                  We'll notify you when investors show interest in your startup
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-muted/50 transition-colors ${
                      !notification.read
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-semibold truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {notification.message}
                          </p>

                          {/* Investment-specific data */}
                          {notification.type === "investment_interest" &&
                            notification.data && (
                              <div className="bg-green-50 p-2 rounded text-xs space-y-1 mb-2">
                                <div className="flex justify-between">
                                  <span>Amount:</span>
                                  <span className="font-semibold text-green-700">
                                    ${notification.data.investmentAmount}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Type:</span>
                                  <span className="capitalize">
                                    {notification.data.investmentType}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Timeline:</span>
                                  <span>{notification.data.timeline}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Investor:</span>
                                  <span className="font-semibold">
                                    {notification.data.investorName}
                                  </span>
                                </div>
                                {notification.data.investorEmail && (
                                  <div className="flex justify-between">
                                    <span>Email:</span>
                                    <a
                                      href={`mailto:${notification.data.investorEmail}`}
                                      className="text-blue-600 hover:underline"
                                    >
                                      {notification.data.investorEmail}
                                    </a>
                                  </div>
                                )}
                                {notification.data.investorPhone && (
                                  <div className="flex justify-between">
                                    <span>Phone:</span>
                                    <a
                                      href={`tel:${notification.data.investorPhone}`}
                                      className="text-blue-600 hover:underline"
                                    >
                                      {notification.data.investorPhone}
                                    </a>
                                  </div>
                                )}
                                {notification.data.contactPreference && (
                                  <div className="flex justify-between">
                                    <span>Prefers:</span>
                                    <span className="capitalize">
                                      {notification.data.contactPreference}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                            <div className="flex space-x-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Mark read
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.length > 10 && (
                  <div className="p-4 text-center border-t">
                    <p className="text-xs text-muted-foreground">
                      Showing latest 10 notifications
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
