import { toast } from "react-toastify";
import moment from "moment";

export const successToast = (message: string, timer = 3000) => {
  toast.success(message, {
    position: "top-right",
    autoClose: timer,
    hideProgressBar: false,
    theme: "light",
  });
};

export const errorToast = (message: string, timer = 3000) => {
  toast.success(message, {
    position: "top-right",
    autoClose: timer,
    hideProgressBar: false,
    theme: "light",
  });
};

export function formatLastSeen(lastSeen: string) {
  if (!lastSeen) return "last seen unknown";

  const m = moment(lastSeen);
  const now = moment();

  if (!m.isValid()) return "last seen unknown";

  if (now.diff(m, "minutes") < 1) {
    return "last seen just now";
  } else if (now.isSame(m, "day")) {
    return `last seen today at ${m.format("h:mm A")}`;
  } else if (now.clone().subtract(1, "day").isSame(m, "day")) {
    return `last seen yesterday at ${m.format("h:mm A")}`;
  } else if (now.isSame(m, "year")) {
    return `last seen on ${m.format("MMM D [at] h:mm A")}`;
  } else {
    return `last seen on ${m.format("MMM D, YYYY [at] h:mm A")}`;
  }
}
