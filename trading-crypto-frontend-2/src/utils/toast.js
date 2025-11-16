import { useSnackbar } from "notistack";

export function useToast() {
  const { enqueueSnackbar } = useSnackbar();

  const toastSuccess = (msg) =>
    enqueueSnackbar(msg, { variant: "success", className: "success" });

  const toastError = (msg) =>
    enqueueSnackbar(msg, { variant: "error", className: "error" });

  const toastWarning = (msg) =>
    enqueueSnackbar(msg, { variant: "warning", className: "warning" });

  const toastInfo = (msg) =>
    enqueueSnackbar(msg, { variant: "info", className: "info" });

  return { toastSuccess, toastError, toastWarning, toastInfo };
}
