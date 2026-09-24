const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

const API = isLocal
    ? "http://localhost:5001"
    : "https://checkit-interactive-shopping-list.onrender.com";