import { getAdmins, createAdmin } from './service';

// create default admin account:
(async () => {
  if ((await getAdmins()).length > 0) {
    return;
  }
  return createAdmin({
    username: process.env.ADMIN_DEFAULT_USERNAME || "admin",
    password: process.env.ADMIN_DEFAULT_PASSWORD || "admin123"
  });
})();