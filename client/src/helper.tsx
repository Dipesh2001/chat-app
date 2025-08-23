import { toast } from "react-toastify";

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
