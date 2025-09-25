import { toast } from "react-toastify";
import "./Toaster.css";

export const showError = (message: string) => {
  return toast.error(message, {
    position: "top-right",
  });
};

export const showSuccess = (message: string) => {
  return toast.success(message, {
    position: "top-right",
  });
};

export const showInfo = (message: string) => {
  return toast.info(message, {
    position: "top-right",
  });
};


