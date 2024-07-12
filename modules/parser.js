/**
 * Get Email & Name from String
 *
 * @param {String} input Hello World <hello@world.com>, "Hello World" <hello@world.com>
 * @returns {Object} objects ({ sender, email })
 */
function getEmailAndNameFromString(input) {
  const regex = /^\"*([^\"]*)\"*.<(.+)>$/gm;
  const match = regex.exec(input);

  if (match) {
    return { sender: match[1], email: match[2] };
  }

  return { sender: "(N/A)", email: input };
}

/**
 * Get Sender From Message
 *
 * @param {Object} message
 * @returns {Object}
 */
export function getSender(message = {}) {
  const res = getEmailAndNameFromString(message.author);
  const date = message.date?.toISOString();
  const subject = message.subject;
  const to = message.recipients?.join(",");

  return { ...res, to, date, subject };
}

export function getPlainTextFromMessage(message = {}) {
  const queue = [message];
  const body = [];
  const html = [];

  while (queue.length) {
    const part = queue.pop();
    if (part?.contentType === "text/plain") {
      body.push(part.body);
    } else if (part?.contentType === "text/html") {
      html.push(part.body);
    }
    if (part?.parts?.length) {
      queue.push(...part?.parts);
    }
  }

  return body.length ? body.join("\n\n") : html?.[0];
}

export function objectArrayToCSV(args) {
  const { columnDelimiter = ",", lineDelimiter = "\n", data } = args;

  if (data == null || !data.length) return null;

  let result = "";
  result += Object.keys(data[0])
    .map((key) => browser.i18n.getMessage(`label_${key}`))
    .join(columnDelimiter);
  result += lineDelimiter;

  result = data.reduce(
    (str, item) =>
      str +
      Object.values(item)
        .map((str) => str ? `"${str.replaceAll('"', '""')}"` : "")
        .join(columnDelimiter) +
      lineDelimiter,
    result
  );

  return result;
}
