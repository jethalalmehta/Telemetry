import React, { useState, useRef, useEffect } from 'react';
import { AppNotification } from '../types';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '../utils/storage';
import { 
  Bell, 
  CheckCheck, 
  ExternalLink, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  X
} from 'lucide-react';

interface NotificationDropdownProps {
  userId: string;
  onNavigateToApplication?: (applicationId?: string) => void;
  onRefresh?: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  userId,
  onNavigateToApplication,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getNotifications(userId));
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const refreshNotifs = () => {
    setNotifications(getNotifications(userId));
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    refreshNotifs();
    setIsOpen(prev => !prev);
  };

  const handleMarkAsRead = (notifId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markNotificationAsRead(userId, notifId);
    refreshNotifs();
    if (onRefresh) onRefresh();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(userId);
    refreshNotifs();
    if (onRefresh) onRefresh();
  };

  const handleClickNotification = (notif: AppNotification) => {
    if (!notif.isRead) {
      markNotificationAsRead(userId, notif.id);
      refreshNotifs();
      if (onRefresh) onRefresh();
    }
    setIsOpen(false);
    if (onNavigateToApplication && notif.applicationId) {
      onNavigateToApplication(notif.applicationId);
    }
  };

  const formatTimestamp = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoDate).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Unread Badge */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg text-[#203B53] hover:bg-[#F5F7FA] transition-colors cursor-pointer group focus-visible:outline-none"
        title="Notifications & Placement Updates"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5 text-[#203B53] group-hover:text-[#398879] transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-50 overflow-hidden animate-fade-in text-xs">
          {/* Header */}
          <div className="p-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#FAFCFE]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#203B53]">Placement Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[#398879] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Bell className="w-7 h-7 text-gray-300 mx-auto" />
                <p className="font-semibold text-gray-700">No notifications yet</p>
                <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                  When the Campus Placement Cell or recruiters record interview schedules or shortlisted statuses, you will be notified here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isSelectedOffer = notif.statusUpdatedTo === 'Selected' || notif.statusUpdatedTo === 'Offer Received';
                const isInterview = notif.statusUpdatedTo === 'Interview';
                const isShortlisted = notif.statusUpdatedTo === 'Shortlisted';
                const isRejected = notif.statusUpdatedTo === 'Rejected' || notif.statusUpdatedTo === 'Not Selected';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleClickNotification(notif)}
                    className={`p-3.5 transition-colors cursor-pointer hover:bg-[#F5F7FA] relative flex items-start gap-3 ${
                      !notif.isRead ? 'bg-[#F0F7FA]/70' : 'bg-white'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="shrink-0 mt-0.5">
                      {isSelectedOffer ? (
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      ) : isInterview ? (
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                      ) : isShortlisted ? (
                        <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isRejected ? (
                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-gray-100 text-[#203B53] flex items-center justify-center">
                          <Briefcase className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-[#203B53] truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatTimestamp(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#263746] leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>

                      {notif.adminNote && (
                        <div className="mt-1.5 p-1.5 rounded bg-white border border-[#E2E8F0] text-[10px] text-[#758392]">
                          <span className="font-semibold text-[#203B53]">TPO Note: </span>
                          <span>{notif.adminNote}</span>
                        </div>
                      )}

                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-[#398879] font-medium flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          <span>View in Application Pipeline</span>
                        </span>

                        {!notif.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="text-[10px] text-gray-400 hover:text-[#203B53] font-medium"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#398879] shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#FAFCFE] border-t border-[#E2E8F0] text-center">
            <span className="text-[10px] text-[#758392]">
              Real-time synchronization with Campus Placement Cell & TPO updates.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
