export const getCurrentRole = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return (user?.role || "").toLowerCase();
  } catch (error) {
    return "";
  }
};