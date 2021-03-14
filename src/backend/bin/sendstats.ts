#!/usr/bin/env node

import { mailgun, from as emailFrom, cronEmailReceiver } from '../mailgun';
import { getStats } from '../user/service';
import { format } from 'util';

(async () => {
  const res = await getStats();
  if (! cronEmailReceiver) {
    throw new Error("Cron email reciever is not set! Please fix");
  }
  console.log("Result: ");
  console.log(res);
  mailgun.messages().send({
    from: emailFrom,
    to: cronEmailReceiver,
    subject: "Basma User Registration",
    text: format(
      "User stats:\nLast 24 hours: %s\nLast week: %s\nLast month: %s\nLast 3 months: %s\nLast year: %s",
      ...Object.values(res)
    )
  })
})();