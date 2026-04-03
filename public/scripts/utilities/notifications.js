let notifyTimer;

export const showNotification = (message, type = "info", duration = 3000) => {
  const notification = document.querySelector("#notification-container");
  notification.className = `notification ${type}`;
  const paragraph = notification.querySelector("#notification-text");
  paragraph.textContent = message;

  clearTimeout(notifyTimer);

  notifyTimer = setTimeout(() => {
    notification.classList.remove(type);
  }, duration);
};
