import { Menu } from 'antd'
import Button from './button'
import { Trans } from '@lingui/macro'
import { CloseIcon } from './icons'

const NotificationPanel = ({
  notifications,
  onViewMore,
  loading,
  isMobile = false,
  onClose,
  onNotificationClick,
  hasMoreNotifications,
}) => {
  return (
    <div className="notification-dropdown">
      {isMobile && (
        <div className="notification-header">
          <span>Notifications</span>
          <Button type="link" icon={<CloseIcon />} onClick={onClose} />
        </div>
      )}

      <div
        className="notification-content"
        style={{
          maxHeight: isMobile ? '600px' : '420px',
          overflowY: 'auto',
        }}
      >
        <Menu
          className="notification-menu"
          style={{ border: 'none', boxShadow: 'none' }}
        >
          {loading ? (
            <Menu.Item
              disabled
              style={{ textAlign: 'center', padding: '20px' }}
            >
              Loading...
            </Menu.Item>
          ) : notifications.length === 0 ? (
            <Menu.Item
              disabled
              style={{ textAlign: 'center', padding: '20px' }}
            >
              No notifications
            </Menu.Item>
          ) : (
            <>
              {notifications.map((notif, index) => (
                <Menu.Item
                  key={notif.id || index}
                  onClick={() => onNotificationClick(notif)}
                >
                  <div className="notification-item">
                    <div className="notification-sender">
                      {notif.sender}{' '}
                      {notif.type && (
                        <>
                          <span>IN</span>{' '}
                          <span className="channel-name">{notif.type}</span>
                        </>
                      )}
                    </div>
                    <div
                      className="notification-message"
                      style={{
                        fontWeight: notif.status === 'unread' ? 'bold' : '500',
                      }}
                    >
                      {notif.message}
                    </div>
                    <div className="notification-time">{notif.time}</div>
                  </div>
                </Menu.Item>
              ))}
            </>
          )}
        </Menu>
      </div>

      {!loading && hasMoreNotifications && (
        <div className="view-more-container">
          <Button type="ghost" onClick={onViewMore}>
            <Trans>VIEW MORE</Trans>
          </Button>
        </div>
      )}
    </div>
  )
}

export default NotificationPanel
