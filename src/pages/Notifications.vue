<template>
  <div id="notification-page">
    <h1>
      Notifications 
      <span v-if="unreadCount">({{ unreadCount }} unread)</span>
    </h1>
    <loader v-if="loader" />

    <div v-if="!loader && notifications.length === 0" class="no-notifications">
      <p>No notifications found.</p>
    </div>

    <ul v-if="!loader && notifications.length" class="notification-list">
      <li
        v-for="notification in notifications"
        :key="notification.id"
        :class="{ unread: notification.read === 0 }"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-content">
          <h3>{{ notification.title }}</h3>
          <p>{{ notification.message }}</p>
        </div>
        <small class="notification-date">
          {{ formatDate(notification.created_at) }}
        </small>
      </li>
    </ul>

    <!-- Show More button if more pages are available -->
    <button
      v-if="currentPage < lastPage && !loaderMore"
      @click="loadMore"
    >
      Show More
    </button>
    <loader v-if="loaderMore" />
  </div>
</template>

<script>
import axios from "axios";
import api from "@/static/config.json";
import Loader from "@/components/Loader";

export default {
  name: "NotificationPage",
  components: {
    Loader,
  },
  data() {
    return {
      notifications: [],
      loader: false,
      loaderMore: false,
      unreadCount: 0,
      currentPage: 1,
      lastPage: 1,
    };
  },
  computed: {
    token() {
      return this.$store.state.token;
    },
    user() {
      return this.$store.state.user;
    },
  },
  methods: {
    async fetchNotifications(page = 1) {
      // Show different loaders for the initial load vs. loading more
      page === 1 ? (this.loader = true) : (this.loaderMore = true);
      try {
        const response = await axios.get(
          `${api.API_URL}/notifications?business_id=${this.user.business_id}&page=${page}`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
        if (page === 1) {
          this.notifications = response.data.notifications;
        } else {
          // Append new notifications to the existing list
          this.notifications = [...this.notifications, ...response.data.notifications];
        }
        // Update pagination data
        this.currentPage = response.data.pagination.current_page;
        this.lastPage = response.data.pagination.last_page;

        // Load unread count on the initial request
        if (page === 1) {
          this.unreadCount = response.data.unread_count;
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        page === 1 ? (this.loader = false) : (this.loaderMore = false);
      }
    },
    loadMore() {
      if (this.currentPage < this.lastPage) {
        const nextPage = this.currentPage + 1;
        this.fetchNotifications(nextPage);
      }
    },
    // Mark the notification as read
    async markAsRead(notification) {
      if (!notification.read) {
        try {
          await axios.put(api.API_URL + `/notifications/${notification.id}/read?business_id=${this.user.business_id}`, {}, {
            headers: { Authorization: `Bearer ${this.token}` }
          });
          notification.read = true;
          this.$router.replace(notification.link);
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      }
    },
    // Handle notification click
    handleNotificationClick(notification) {
      if (notification.read === 0) {
        this.markAsRead(notification);
      }
     //this.$router.replace(notification.link);
    },
    // Formats the date string into a locale-specific format
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleString();
    },
  },
  created() {
    this.fetchNotifications();
  },
};
</script>

<style scoped>
#notification-page {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

h1 {
  font-size: 2rem;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.no-notifications {
  text-align: center;
  font-size: 1.1rem;
  color: #777;
}

.notification-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notification-list li {
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 15px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.notification-list li:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.notification-list li.unread {
  border-left: 5px solid #007BFF;
  background-color: #eef6ff;
}

.notification-content h3 {
  font-size: 1.25rem;
  margin: 0;
  color: #007BFF;
}

.notification-content p {
  margin: 10px 0;
  color: #555;
  font-size: 1rem;
}

.notification-date {
  align-self: flex-end;
  font-size: 0.875rem;
  color: #999;
  margin-top: 5px;
}

button {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  background-color: #007BFF;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
</style>
