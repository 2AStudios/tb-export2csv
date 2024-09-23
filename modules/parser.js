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

export async function getPlainTextFromMessage(messageId) {
  try {
    // Use the new API in TB 128 to list inline text parts
    const parts = await messenger.messages.listInlineTextParts(messageId);
    console.log(parts);
    if (!parts || parts.length === 0) {
      return "(No content)";
    }

    // Extract text/plain or convert text/html to plain text
    let body = "";
    for (let part of parts) {
      if (part.contentType === "text/plain") {
        body += part.content + "\n\n";
      } else if (part.contentType === "text/html") {
        body += await messenger.messengerUtilities.convertToPlainText(
          part.content
        );
      }
    }

    return body.trim();
  } catch (error) {
    console.error(
      `Error fetching inline text parts for messageId ${messageId}:`,
      error
    );
    return "(Error retrieving message content)";
  }
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
        .map((str) => (str ? `"${str.replaceAll('"', '""')}"` : ""))
        .join(columnDelimiter) +
      lineDelimiter,
    result
  );

  return result;
}
